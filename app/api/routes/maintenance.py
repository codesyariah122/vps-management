from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.maintenance import get_maintenance_overview, get_maintenance_settings, update_maintenance_settings


router = APIRouter()


class MaintenanceSettingsPayload(BaseModel):
    maintenance_disk_critical: int = Field(ge=70, le=100)
    maintenance_memory_critical: int = Field(ge=70, le=100)
    maintenance_swap_critical: int = Field(ge=10, le=100)
    maintenance_log_retention_days: int = Field(ge=1, le=365)
    maintenance_temp_file_days: int = Field(ge=1, le=365)


@router.get("/overview")
async def overview():
    return get_maintenance_overview()


@router.get("/settings")
async def settings():
    return get_maintenance_settings()


@router.put("/settings")
async def save_settings(payload: MaintenanceSettingsPayload):
    return update_maintenance_settings(payload.model_dump())
