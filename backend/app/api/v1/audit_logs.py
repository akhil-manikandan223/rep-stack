from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole
from app.schemas.audit_log import AuditLogRead

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("", response_model=list[AuditLogRead])
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AuditLog]:
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(200)
    if not current_user.is_super_admin:
        if current_user.role != UserRole.TENANT_ADMIN:
            stmt = stmt.where(AuditLog.actor_user_id == current_user.id)
        else:
            stmt = stmt.where(AuditLog.tenant_id == current_user.tenant_id)
    return list((await db.execute(stmt)).scalars().all())
