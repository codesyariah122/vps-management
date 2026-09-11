from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.services.audit import record_audit_event
from app.services.auth import authentication_configured, is_admin, start_session, verify_password


router = APIRouter()


class LoginPayload(BaseModel):
    password: str


@router.get("/session")
async def session(request: Request):
    return {"authenticated": is_admin(request), "csrf_token": request.session.get("csrf_token") if is_admin(request) else None}


@router.post("/login")
async def login(payload: LoginPayload, request: Request):
    if not authentication_configured():
        raise HTTPException(status_code=503, detail="Admin authentication is not configured on this server.")
    if not verify_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    csrf_token = start_session(request.session)
    record_audit_event("auth.login", "Administrator session started", request)
    return {"authenticated": True, "csrf_token": csrf_token}


@router.post("/logout")
async def logout(request: Request):
    if is_admin(request):
        record_audit_event("auth.logout", "Administrator session ended", request)
    request.session.clear()
    return {"authenticated": False}
