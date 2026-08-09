import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, String, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserRole(str, enum.Enum):
    TENANT_ADMIN = "tenant_admin"
    GENERAL_COACH = "general_coach"
    PERSONAL_TRAINER = "personal_trainer"
    FRONT_DESK = "front_desk"


# The underlying Postgres enum type also carries a legacy 'trainer' label with
# no remaining rows (see the migration that split it into general_coach) --
# Postgres has no DROP VALUE, so it stays, just never emitted by this class.
user_role_enum = PgEnum(UserRole, name="user_role", values_callable=lambda e: [m.value for m in e])


class StaffAvailability(str, enum.Enum):
    AVAILABLE = "available"
    OFF_SHIFT = "off_shift"


staff_availability_enum = PgEnum(
    StaffAvailability, name="staff_availability", values_callable=lambda e: [m.value for m in e]
)


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "(is_super_admin AND tenant_id IS NULL AND role IS NULL) OR "
            "(NOT is_super_admin AND tenant_id IS NOT NULL AND role IS NOT NULL)",
            name="super_admin_or_tenant_scoped",
        ),
        UniqueConstraint("tenant_id", "email", name="uq_users_tenant_id_email"),
        Index(
            "uq_users_super_admin_email",
            "email",
            unique=True,
            postgresql_where=text("is_super_admin"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True
    )
    email: Mapped[str] = mapped_column(String(255), index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole | None] = mapped_column(user_role_enum, nullable=True)
    availability_status: Mapped[StaffAvailability | None] = mapped_column(
        staff_availability_enum, nullable=True
    )
    is_super_admin: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
