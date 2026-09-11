from fastapi import APIRouter

from app.services.settings import get_settings
from app.services.system import get_system_info, get_top_processes
from app.services.systemd import get_services


router = APIRouter()


@router.get("/overview")
async def overview():
    system = get_system_info()
    settings = get_settings()
    warnings = []
    for resource, setting in (("cpu", "cpu_warning"), ("memory", "memory_warning"), ("disk", "disk_warning")):
        if system[resource]["percent"] >= settings[setting]:
            warnings.append({"resource": resource, "percent": system[resource]["percent"], "threshold": settings[setting]})
    return {
        **system,
        "settings": settings,
        "warnings": warnings,
        "services": get_services(),
        "top_processes": get_top_processes(),
    }
