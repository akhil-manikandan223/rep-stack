import uuid

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


async def log_audit_event(
    db: AsyncSession,
    *,
    request: Request,
    actor_user_id: uuid.UUID | None,
    tenant_id: uuid.UUID | None,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    changes: dict | None = None,
) -> None:
    entry = AuditLog(
        tenant_id=tenant_id,
        actor_user_id=actor_user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        changes=changes,
        ip_address=request.client.host if request.client else None,
    )
    db.add(entry)
    await db.flush()
