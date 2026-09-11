"""Small append-only audit trail for privileged dashboard actions."""
import json
from datetime import datetime, timezone
from pathlib import Path


AUDIT_PATH = Path(__file__).resolve().parent.parent / "data" / "audit.jsonl"
MAX_AUDIT_ITEMS = 100


def record_audit_event(action: str, detail: str, request=None) -> None:
    """Record an operational event without storing credentials or request bodies."""
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "detail": detail,
        "source": request.client.host if request and request.client else "local",
    }
    try:
        AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
        with AUDIT_PATH.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(event, separators=(",", ":")) + "\n")
    except OSError:
        # Audit persistence must never make an otherwise safe admin action fail.
        pass


def get_audit_events(limit: int = 30) -> list[dict]:
    limit = max(1, min(limit, MAX_AUDIT_ITEMS))
    try:
        lines = AUDIT_PATH.read_text(encoding="utf-8").splitlines()[-limit:]
        events = [json.loads(line) for line in lines]
        return list(reversed(events))
    except (OSError, json.JSONDecodeError):
        return []
