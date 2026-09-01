from fastapi import APIRouter

from app.services.system import get_system_info


router = APIRouter()


@router.get("/")
async def get_servers():

    system = get_system_info()

    return {
        "servers": [
            {
                "id": "local",
                "name": "Local Development",
                "hostname": system["hostname"],
                "os": system["os"],
                "kernel": system["kernel"],
                "architecture": system["architecture"],
                "cpu": system["cpu"],
                "memory": system["memory"],
                "disk": system["disk"],
                "swap": system["swap"],
                "uptime": system["uptime"],
                "status": "online",
            }
        ]
    }


@router.get("/{server_id}")
async def get_server(server_id: str):

    if server_id != "local":

        return {
            "error": "Server not found"
        }

    system = get_system_info()

    return {
        "id": "local",
        "name": "Local Development",
        **system,
        "status": "online",
    }