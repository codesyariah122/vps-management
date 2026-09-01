from fastapi import APIRouter

from app.services.projects import get_projects


router = APIRouter()


@router.get("/")
async def projects():

    return {
        "projects": get_projects()
    }