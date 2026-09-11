from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.services.audit import record_audit_event
from app.services.auth import is_admin, valid_csrf
from app.services.systemd import get_services, run_service_action


router = APIRouter()


class ServiceActionPayload(BaseModel):
    action: str


@router.get("/")
async def services():

    return {
        "services": get_services()
    }


@router.post("/{service_id}/action")
async def service_action(service_id: str, payload: ServiceActionPayload, request: Request):
    if not is_admin(request):
        raise HTTPException(status_code=401, detail="Admin authentication required for service control.")
    if not valid_csrf(request):
        raise HTTPException(status_code=403, detail="Invalid maintenance security token.")
    try:
        result = run_service_action(service_id, payload.action)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    record_audit_event("service." + payload.action, service_id, request)
    return result
