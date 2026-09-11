import hmac
import os
import secrets


def authentication_configured() -> bool:
    return bool(os.getenv("VPS_MANAGEMENT_ADMIN_PASSWORD"))


def verify_password(password: str) -> bool:
    expected = os.getenv("VPS_MANAGEMENT_ADMIN_PASSWORD")
    return bool(expected) and hmac.compare_digest(password, expected)


def start_session(session) -> str:
    token = secrets.token_urlsafe(32)
    session["is_admin"] = True
    session["csrf_token"] = token
    return token


def is_admin(request) -> bool:
    return bool(request.session.get("is_admin"))


def valid_csrf(request) -> bool:
    token = request.headers.get("X-CSRF-Token", "")
    expected = request.session.get("csrf_token", "")
    return bool(expected) and hmac.compare_digest(token, expected)
