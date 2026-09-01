from fastapi import APIRouter

from app.services.system import get_system_info


router = APIRouter()


@router.get("/overview")
async def overview():

    return get_system_info()