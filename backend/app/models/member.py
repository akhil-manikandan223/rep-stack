import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MemberStatus(str, enum.Enum):
    ACTIVE = "active"
    FROZEN = "frozen"
    CANCELLED = "cancelled"


member_status_enum = PgEnum(MemberStatus, name="member_status", values_callable=lambda e: [m.value for m in e])


class Member(Base):
    __tablename__ = "members"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[MemberStatus] = mapped_column(member_status_enum, default=MemberStatus.ACTIVE)
    has_pt_plan: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    # Record-keeping only for now -- not used to scope a personal trainer's
    # visibility, which currently sees all PT-plan members tenant-wide.
    assigned_trainer_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    join_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
