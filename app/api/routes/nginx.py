from fastapi import APIRouter

from app.services.nginx import get_nginx_info


router = APIRouter()


@router.get("/")
async def nginx():

    return get_nginx_info()