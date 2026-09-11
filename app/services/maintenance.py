"""Read-only host diagnostics for manual maintenance planning."""
import shutil
import subprocess
import os
import hashlib
from datetime import datetime, timezone
from pathlib import Path

import psutil

from app.services.settings import get_settings, update_settings
from app.services.projects import get_projects


MAINTENANCE_DEFAULTS = {
    "maintenance_disk_critical": 90,
    "maintenance_memory_critical": 90,
    "maintenance_swap_critical": 50,
    "maintenance_log_retention_days": 14,
    "maintenance_temp_file_days": 14,
}


def get_maintenance_settings() -> dict:
    saved = get_settings()
    return {key: saved.get(key, value) for key, value in MAINTENANCE_DEFAULTS.items()}


def update_maintenance_settings(values: dict) -> dict:
    allowed = {key: value for key, value in values.items() if key in MAINTENANCE_DEFAULTS}
    update_settings(allowed)
    return get_maintenance_settings()


def get_path_size(path: str) -> int | None:
    if not Path(path).exists():
        return None
    try:
        result = subprocess.run(
            ["du", "-sk", path],
            capture_output=True,
            text=True,
            timeout=8,
        )
        if result.returncode == 0:
            return int(result.stdout.split()[0]) * 1024
    except (OSError, subprocess.TimeoutExpired, ValueError, IndexError):
        pass
    return None


def get_journal_size() -> int | None:
    if not shutil.which("journalctl"):
        return None
    try:
        result = subprocess.run(["journalctl", "--disk-usage"], capture_output=True, text=True, timeout=4)
        import re
        match = re.search(r"takes up\s+([\d.]+)([KMGTP])", result.stdout)
        if match:
            units = {"K": 1, "M": 2, "G": 3, "T": 4, "P": 5}
            return int(float(match.group(1)) * (1024 ** units[match.group(2)]))
    except (OSError, subprocess.TimeoutExpired):
        pass
    return None


def get_maintenance_overview() -> dict:
    settings = get_maintenance_settings()
    disk = psutil.disk_usage("/")
    memory = psutil.virtual_memory()
    swap = psutil.swap_memory()
    findings = []

    if disk.percent >= settings["maintenance_disk_critical"]:
        findings.append({"resource": "Disk", "level": "critical", "message": f"Disk root is {disk.percent:.1f}% used."})
    if memory.percent >= settings["maintenance_memory_critical"]:
        findings.append({"resource": "Memory", "level": "critical", "message": f"Memory is {memory.percent:.1f}% used."})
    if swap.percent >= settings["maintenance_swap_critical"]:
        findings.append({"resource": "Swap", "level": "warning", "message": f"Swap is {swap.percent:.1f}% used."})

    return {
        "mode": "manual",
        "settings": settings,
        "resources": {
            "disk": {"percent": disk.percent, "used": disk.used, "free": disk.free},
            "memory": {"percent": memory.percent, "used": memory.used, "available": memory.available},
            "swap": {"percent": swap.percent, "used": swap.used, "free": swap.free},
        },
        "storage_scan": [
            {"name": "System logs", "path": "/var/log", "size": get_path_size("/var/log")},
            {"name": "Package cache", "path": "/var/cache", "size": get_path_size("/var/cache")},
            {"name": "Temporary files", "path": "/tmp", "size": get_path_size("/tmp")},
            {"name": "Docker data", "path": "/var/lib/docker", "size": get_path_size("/var/lib/docker")},
            {"name": "Journal", "path": "journalctl", "size": get_journal_size()},
        ],
        "findings": findings,
        "playbook": [
            {"id": "journal", "title": "Review archived system logs", "description": "Check journal size before removing archived logs older than the configured retention.", "command": f"journalctl --disk-usage && journalctl --vacuum-time={settings['maintenance_log_retention_days']}d", "risk": "Review before running"},
            {"id": "apt", "title": "Clear package cache", "description": "Removes downloaded package archives; installed packages are not removed.", "command": "apt-get clean", "risk": "Manual action"},
            {"id": "docker", "title": "Inspect unused Docker data", "description": "Inspect first. Pruning images or volumes can affect unused deployments.", "command": "docker system df", "risk": "Inspect only"},
            {"id": "processes", "title": "Investigate resource-heavy processes", "description": "Review the process list before restarting any allowlisted application service.", "command": "ps aux --sort=-%mem | head -n 15", "risk": "Inspect only"},
        ],
    }


def get_inactive_project_candidates() -> list[dict]:
    active_paths = {Path(project["path"]).resolve() for project in get_projects() if project.get("path") and project.get("exists")}
    # Scan only administrator-configured root folders.  Deriving parents from
    # active project paths can mistakenly classify framework source folders
    # (for example app/Models) as inactive projects.
    parent_paths = {
        Path(raw_path.strip()).resolve()
        for raw_path in os.getenv("VPS_MANAGEMENT_PROJECT_ROOTS", "").split(",")
        if raw_path.strip() and Path(raw_path.strip()).is_dir()
    }
    candidates = []
    for parent in parent_paths:
        try:
            for path in parent.iterdir():
                if not path.is_dir() or path.is_symlink() or path.resolve() in active_paths:
                    continue
                resolved = path.resolve()
                if any(active.is_relative_to(resolved) for active in active_paths):
                    continue
                candidates.append({
                    "id": hashlib.sha256(str(resolved).encode()).hexdigest()[:16], "name": path.name,
                    "path": str(resolved), "size": get_path_size(str(resolved)),
                    "last_modified": datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat(),
                    "reason": "Not referenced by the current Nginx project inventory within a configured project root.",
                })
        except OSError:
            continue
    return sorted(candidates, key=lambda item: item["last_modified"])


def quarantine_project(candidate_id: str, confirmation: str) -> dict:
    candidate = next((item for item in get_inactive_project_candidates() if item["id"] == candidate_id), None)
    if not candidate:
        raise ValueError("Candidate is no longer eligible for quarantine.")
    if confirmation != candidate["name"]:
        raise ValueError("Project name confirmation does not match.")
    source = Path(candidate["path"])
    if source.is_symlink() or not source.is_dir():
        raise ValueError("Only a verified project directory can be quarantined.")
    root = Path(os.getenv("VPS_MANAGEMENT_QUARANTINE_ROOT", "/var/www/.vps-management-quarantine")).resolve()
    root.mkdir(parents=True, exist_ok=True)
    destination = root / f"{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}-{source.name}"
    shutil.move(str(source), str(destination))
    return {"status": "quarantined", "name": candidate["name"], "from": str(source), "to": str(destination)}
