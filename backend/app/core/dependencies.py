import uuid
from collections.abc import AsyncGenerator, Callable

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.base import AsyncSessionLocal
from app.middleware.tenant_resolution import resolve_tenant
from app.models.feature import TenantFeature
from app.models.tenant import Tenant
from app.models.user import User, UserRole

_bearer_scheme = HTTPBearer(auto_error=False)

# A syntactically-valid sentinel so app.tenant_id is ALWAYS a well-formed uuid string
# on every request, never unset/empty -- avoids relying on how Postgres's custom GUCs
# behave across pooled-connection reuse when a value is only ever cleared implicitly.
_NIL_TENANT_ID = uuid.UUID(int=0)


async def get_db(tenant: Tenant | None = Depends(resolve_tenant)) -> AsyncGenerator[AsyncSession, None]:
    """Per-request DB session with the Postgres RLS tenant variable set for the
    resolved tenant. Requests with no tenant (admin/super-admin context) get RLS
    bypassed rather than scoped to a sentinel tenant, since super-admin genuinely
    needs cross-tenant access."""
    async with AsyncSessionLocal() as session:
        # SET LOCAL doesn't support bound parameters -- tenant.id is a trusted
        # uuid.UUID from our own DB row, safe to interpolate directly.
        tenant_id = tenant.id if tenant is not None else _NIL_TENANT_ID
        await session.execute(text(f"SET LOCAL app.tenant_id = '{tenant_id}'"))
        await session.execute(text(f"SET LOCAL app.bypass_rls = '{'false' if tenant is not None else 'true'}'"))
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


def _extract_claims(credentials: HTTPAuthorizationCredentials | None) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        claims = decode_token(credentials.credentials)
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    if claims.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not an access token")
    return claims


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
    tenant: Tenant | None = Depends(resolve_tenant),
) -> User:
    claims = _extract_claims(credentials)

    user = (await db.execute(select(User).where(User.id == uuid.UUID(claims["sub"])))).scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    if user.is_super_admin:
        if tenant is not None:
            # A super-admin credential presented on a tenant subdomain is not honored there —
            # keeps super-admin access confined to the admin context.
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Use the admin domain")
        return user

    if tenant is None or user.tenant_id != tenant.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User does not belong to this tenant"
        )
    return user


def require_role(*roles: UserRole) -> Callable[[User], User]:
    def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.is_super_admin:
            return current_user
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return current_user

    return _check


def require_super_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin only")
    return current_user


def require_feature(feature_key: str) -> Callable:
    async def _check(
        tenant: Tenant | None = Depends(resolve_tenant),
        db: AsyncSession = Depends(get_db),
    ) -> None:
        if tenant is None:
            return
        row = (
            await db.execute(
                select(TenantFeature).where(
                    TenantFeature.tenant_id == tenant.id,
                    TenantFeature.feature_key == feature_key,
                    TenantFeature.enabled.is_(True),
                )
            )
        ).scalar_one_or_none()
        if row is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail=f"Feature '{feature_key}' is not enabled"
            )

    return _check
