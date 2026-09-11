from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.services.auth import is_admin, valid_csrf
from app.services.maintenance import get_inactive_project_candidates, get_maintenance_overview, get_maintenance_settings, quarantine_project, update_maintenance_settings


router = APIRouter()


class MaintenanceSettingsPayload(BaseModel):
    maintenance_disk_critical: int = Field(ge=70, le=100)
    maintenance_memory_critical: int = Field(ge=70, le=100)
    maintenance_swap_critical: int = Field(ge=10, le=100)
    maintenance_log_retention_days: int = Field(ge=1, le=365)
    maintenance_temp_file_days: int = Field(ge=1, le=365)


class QuarantinePayload(BaseModel):
    candidate_id: str
    confirmation: str


def require_admin(request: Request, write: bool = False):
    if not is_admin(request):
        raise HTTPException(status_code=401, detail="Admin authentication required.")
    if write and not valid_csrf(request):
        raise HTTPException(status_code=403, detail="Invalid maintenance security token.")


@router.get("/overview")
async def overview(request: Request):
    require_admin(request)
    return get_maintenance_overview()


@router.get("/settings")
async def settings(request: Request):
    require_admin(request)
    return get_maintenance_settings()


@router.put("/settings")
async def save_settings(payload: MaintenanceSettingsPayload, request: Request):
    require_admin(request, write=True)
    return update_maintenance_settings(payload.model_dump())


@router.get("/candidates")
async def candidates(request: Request):
    require_admin(request)
    return {"candidates": get_inactive_project_candidates()}


@router.post("/quarantine")
async def quarantine(payload: QuarantinePayload, request: Request):
    require_admin(request, write=True)
    try:
        return quarantine_project(payload.candidate_id, payload.confirmation)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
