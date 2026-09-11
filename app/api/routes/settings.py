from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.settings import get_settings, update_settings


router = APIRouter()


class SettingsPayload(BaseModel):
    refresh_interval: int = Field(ge=5, le=300)
    cpu_warning: int = Field(ge=50, le=100)
    memory_warning: int = Field(ge=50, le=100)
    disk_warning: int = Field(ge=50, le=100)


@router.get("/")
async def settings():
    return get_settings()


@router.put("/")
async def save_settings(payload: SettingsPayload):
    try:
        return update_settings(payload.model_dump())
    except OSError as error:
        raise HTTPException(status_code=500, detail="Unable to save settings") from error
