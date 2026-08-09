import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.log import log_audit_event
from app.core.dependencies import get_db, require_role
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


async def _get_user_or_404(db: AsyncSession, tenant_id: uuid.UUID | None, user_id: str) -> User:
    user = (
        await db.execute(select(User).where(User.id == user_id, User.tenant_id == tenant_id))
    ).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("", response_model=list[UserRead])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TENANT_ADMIN, UserRole.FRONT_DESK)),
) -> list[User]:
    return list(
        (await db.execute(select(User).where(User.tenant_id == current_user.tenant_id))).scalars().all()
    )


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TENANT_ADMIN)),
) -> User:
    existing = (
        await db.execute(
            select(User).where(User.tenant_id == current_user.tenant_id, User.email == payload.email)
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    user = User(
        tenant_id=current_user.tenant_id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    await db.flush()

    await log_audit_event(
        db,
        request=request,
        actor_user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        action="user.created",
        entity_type="user",
        entity_id=str(user.id),
        changes={"email": user.email, "role": user.role.value},
    )
    return user


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: str,
    payload: UserUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TENANT_ADMIN)),
) -> User:
    user = await _get_user_or_404(db, current_user.tenant_id, user_id)

    changes: dict[str, dict[str, object]] = {}
    if payload.role is not None and payload.role != user.role:
        changes["role"] = {"old": user.role.value if user.role else None, "new": payload.role.value}
        user.role = payload.role
    if payload.is_active is not None and payload.is_active != user.is_active:
        changes["is_active"] = {"old": user.is_active, "new": payload.is_active}
        user.is_active = payload.is_active
    if payload.availability_status is not None and payload.availability_status != user.availability_status:
        changes["availability_status"] = {
            "old": user.availability_status.value if user.availability_status else None,
            "new": payload.availability_status.value,
        }
        user.availability_status = payload.availability_status

    if changes:
        await log_audit_event(
            db,
            request=request,
            actor_user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            action="user.updated",
            entity_type="user",
            entity_id=str(user.id),
            changes=changes,
        )
    return user
