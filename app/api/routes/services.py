from fastapi import APIRouter

from app.services.systemd import get_services


router = APIRouter()


@router.get("/")
async def services():

    return {
        "services": get_services()
    }