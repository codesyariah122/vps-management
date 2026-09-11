import platform
import shutil
import subprocess
from pathlib import Path


def get_system_logs(lines: int = 80) -> dict:
    """Read recent host logs through a fixed, safe source only."""
    lines = max(10, min(lines, 250))
    log_path = Path("/var/log/system.log")
    if platform.system().lower() == "linux" and shutil.which("journalctl"):
        command = ["journalctl", "--no-pager", "-n", str(lines), "-o", "short-iso"]
        source = "journalctl"
    elif log_path.exists():
        command = ["tail", "-n", str(lines), str(log_path)]
        source = str(log_path)
    else:
        return {"source": "system", "available": False, "lines": [], "message": "System log is unavailable on this host."}

    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=5)
        output = result.stdout if result.returncode == 0 else result.stderr
        return {"source": source, "available": result.returncode == 0, "lines": output.splitlines()[-lines:], "message": None if result.returncode == 0 else "Unable to read system log."}
    except (OSError, subprocess.TimeoutExpired):
        return {"source": source, "available": False, "lines": [], "message": "Unable to read system log."}
