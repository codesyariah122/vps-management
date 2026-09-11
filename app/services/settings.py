"""Persistent, non-sensitive dashboard preferences."""
import json
from pathlib import Path


SETTINGS_PATH = Path(__file__).resolve().parent.parent / "data" / "settings.json"
DEFAULT_SETTINGS = {
    "refresh_interval": 10,
    "cpu_warning": 85,
    "memory_warning": 85,
    "disk_warning": 85,
    "maintenance_disk_critical": 90,
    "maintenance_memory_critical": 90,
    "maintenance_swap_critical": 50,
    "maintenance_log_retention_days": 14,
    "maintenance_temp_file_days": 14,
}


def get_settings() -> dict:
    try:
        saved = json.loads(SETTINGS_PATH.read_text())
        return {**DEFAULT_SETTINGS, **saved}
    except (OSError, json.JSONDecodeError):
        return DEFAULT_SETTINGS.copy()


def update_settings(values: dict) -> dict:
    settings = get_settings()
    for key in DEFAULT_SETTINGS:
        if key in values:
            settings[key] = values[key]
    SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
    SETTINGS_PATH.write_text(json.dumps(settings, indent=2) + "\n")
    return settings
