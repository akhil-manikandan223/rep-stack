from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.middleware.tenant_resolution import resolve_tenant
from app.models.feature import TenantFeature
from app.models.tenant import Tenant
from app.models.user import User

router = APIRouter(prefix="/features", tags=["features"])


@router.get("/enabled", response_model=list[str])
async def list_enabled_features(
    db: AsyncSession = Depends(get_db),
    tenant: Tenant | None = Depends(resolve_tenant),
    _current_user: User = Depends(get_current_user),
) -> list[str]:
    """Feature keys enabled for the caller's own tenant -- any authenticated tenant
    user can call this (unlike /tenants/{id}/features, which is super-admin only),
    since the frontend needs it just to decide what nav items to show."""
    if tenant is None:
        return []
    rows = (
        await db.execute(
            select(TenantFeature.feature_key).where(
                TenantFeature.tenant_id == tenant.id, TenantFeature.enabled.is_(True)
            )
        )
    ).all()
    return [key for (key,) in rows]
