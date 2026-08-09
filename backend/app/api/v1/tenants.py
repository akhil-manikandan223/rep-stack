from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.log import log_audit_event
from app.core.dependencies import get_db, require_super_admin
from app.core.security import hash_password
from app.models.feature import Feature, TenantFeature
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.schemas.tenant import (
    FeatureRead,
    TenantCreate,
    TenantFeatureStatus,
    TenantFeatureToggle,
    TenantRead,
    TenantUpdate,
)
from app.schemas.user import UserRead

router = APIRouter(prefix="/tenants", tags=["tenants"], dependencies=[Depends(require_super_admin)])


async def _get_tenant_or_404(db: AsyncSession, tenant_id: str) -> Tenant:
    tenant = (await db.execute(select(Tenant).where(Tenant.id == tenant_id))).scalar_one_or_none()
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return tenant


@router.get("", response_model=list[TenantRead])
async def list_tenants(db: AsyncSession = Depends(get_db)) -> list[Tenant]:
    return list((await db.execute(select(Tenant).order_by(Tenant.created_at))).scalars().all())


@router.post("", response_model=TenantRead, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    payload: TenantCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    actor: User = Depends(require_super_admin),
) -> Tenant:
    existing = (await db.execute(select(Tenant).where(Tenant.slug == payload.slug))).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    tenant = Tenant(slug=payload.slug, name=payload.name)
    db.add(tenant)
    await db.flush()

    admin_user = User(
        tenant_id=tenant.id,
        email=payload.admin_email,
        hashed_password=hash_password(payload.admin_password),
        role=UserRole.TENANT_ADMIN,
    )
    db.add(admin_user)
    await db.flush()

    await log_audit_event(
        db,
        request=request,
        actor_user_id=actor.id,
        tenant_id=None,
        action="tenant.created",
        entity_type="tenant",
        entity_id=str(tenant.id),
        changes={"slug": tenant.slug, "name": tenant.name, "admin_email": payload.admin_email},
    )
    return tenant


@router.patch("/{tenant_id}", response_model=TenantRead)
async def update_tenant(
    tenant_id: str,
    payload: TenantUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    actor: User = Depends(require_super_admin),
) -> Tenant:
    tenant = await _get_tenant_or_404(db, tenant_id)

    changes: dict[str, dict[str, object]] = {}
    if payload.name is not None and payload.name != tenant.name:
        changes["name"] = {"old": tenant.name, "new": payload.name}
        tenant.name = payload.name
    if payload.is_active is not None and payload.is_active != tenant.is_active:
        changes["is_active"] = {"old": tenant.is_active, "new": payload.is_active}
        tenant.is_active = payload.is_active

    if changes:
        await log_audit_event(
            db,
            request=request,
            actor_user_id=actor.id,
            tenant_id=None,
            action="tenant.updated",
            entity_type="tenant",
            entity_id=str(tenant.id),
            changes=changes,
        )
    return tenant


@router.get("/features", response_model=list[FeatureRead])
async def list_features(db: AsyncSession = Depends(get_db)) -> list[Feature]:
    return list((await db.execute(select(Feature).order_by(Feature.key))).scalars().all())


@router.get("/{tenant_id}", response_model=TenantRead)
async def get_tenant(tenant_id: str, db: AsyncSession = Depends(get_db)) -> Tenant:
    return await _get_tenant_or_404(db, tenant_id)


@router.get("/{tenant_id}/features", response_model=list[TenantFeatureStatus])
async def get_tenant_features(
    tenant_id: str, db: AsyncSession = Depends(get_db)
) -> list[TenantFeatureStatus]:
    tenant = await _get_tenant_or_404(db, tenant_id)

    stmt = (
        select(Feature, TenantFeature.enabled)
        .outerjoin(
            TenantFeature,
            (TenantFeature.feature_key == Feature.key) & (TenantFeature.tenant_id == tenant.id),
        )
        .order_by(Feature.key)
    )
    rows = (await db.execute(stmt)).all()
    return [
        TenantFeatureStatus(key=feature.key, name=feature.name, description=feature.description, enabled=bool(enabled))
        for feature, enabled in rows
    ]


@router.put("/{tenant_id}/features/{feature_key}", status_code=status.HTTP_204_NO_CONTENT)
async def toggle_tenant_feature(
    tenant_id: str,
    feature_key: str,
    payload: TenantFeatureToggle,
    request: Request,
    db: AsyncSession = Depends(get_db),
    actor: User = Depends(require_super_admin),
) -> None:
    tenant = await _get_tenant_or_404(db, tenant_id)
    feature = (await db.execute(select(Feature).where(Feature.key == feature_key))).scalar_one_or_none()
    if feature is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not found")

    row = (
        await db.execute(
            select(TenantFeature).where(
                TenantFeature.tenant_id == tenant.id, TenantFeature.feature_key == feature_key
            )
        )
    ).scalar_one_or_none()
    if row is None:
        row = TenantFeature(tenant_id=tenant.id, feature_key=feature_key, enabled=payload.enabled)
        db.add(row)
    else:
        row.enabled = payload.enabled

    await log_audit_event(
        db,
        request=request,
        actor_user_id=actor.id,
        tenant_id=tenant.id,
        action="tenant.feature_toggled",
        entity_type="tenant_feature",
        entity_id=feature_key,
        changes={"enabled": payload.enabled},
    )


@router.get("/{tenant_id}/users", response_model=list[UserRead])
async def list_tenant_users(tenant_id: str, db: AsyncSession = Depends(get_db)) -> list[User]:
    return list((await db.execute(select(User).where(User.tenant_id == tenant_id))).scalars().all())
