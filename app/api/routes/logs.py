from fastapi import APIRouter, Query

from app.services.logs import get_system_logs


router = APIRouter()


@router.get("/")
async def logs(lines: int = Query(default=80, ge=10, le=250)):
    return get_system_logs(lines)
