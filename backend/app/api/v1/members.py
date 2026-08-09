import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.log import log_audit_event
from app.core.dependencies import get_current_user, get_db, require_role
from app.models.member import Member
from app.models.user import User, UserRole
from app.schemas.member import MemberCreate, MemberRead, MemberUpdate

router = APIRouter(prefix="/members", tags=["members"])


def _for_audit(value: object) -> object:
    """JSONB-safe representation -- enum members and UUIDs aren't natively
    JSON-serializable, and this app's engine has no custom json_serializer."""
    if hasattr(value, "value"):
        return value.value
    if isinstance(value, uuid.UUID):
        return str(value)
    return value


async def _get_member_or_404(db: AsyncSession, tenant_id: uuid.UUID | None, member_id: str) -> Member:
    member = (
        await db.execute(select(Member).where(Member.id == member_id, Member.tenant_id == tenant_id))
    ).scalar_one_or_none()
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return member


@router.get("", response_model=list[MemberRead])
async def list_members(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Member]:
    stmt = select(Member).where(Member.tenant_id == current_user.tenant_id)
    # General coaches don't need to see PT-plan members -- everyone else
    # (admin, front-desk, personal trainers) sees the full roster.
    if current_user.role == UserRole.GENERAL_COACH:
        stmt = stmt.where(Member.has_pt_plan.is_(False))
    return list((await db.execute(stmt)).scalars().all())


@router.post("", response_model=MemberRead, status_code=status.HTTP_201_CREATED)
async def create_member(
    payload: MemberCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TENANT_ADMIN, UserRole.FRONT_DESK)),
) -> Member:
    member = Member(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(member)
    await db.flush()

    await log_audit_event(
        db,
        request=request,
        actor_user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        action="member.created",
        entity_type="member",
        entity_id=str(member.id),
        changes={"full_name": member.full_name},
    )
    return member


@router.patch("/{member_id}", response_model=MemberRead)
async def update_member(
    member_id: str,
    payload: MemberUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TENANT_ADMIN, UserRole.FRONT_DESK)),
) -> Member:
    member = await _get_member_or_404(db, current_user.tenant_id, member_id)

    changes: dict[str, dict[str, object]] = {}
    for field, new_value in payload.model_dump(exclude_unset=True).items():
        old_value = getattr(member, field)
        if new_value != old_value:
            changes[field] = {"old": _for_audit(old_value), "new": _for_audit(new_value)}
            setattr(member, field, new_value)

    if changes:
        await log_audit_event(
            db,
            request=request,
            actor_user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            action="member.updated",
            entity_type="member",
            entity_id=str(member.id),
            changes=changes,
        )
    return member
