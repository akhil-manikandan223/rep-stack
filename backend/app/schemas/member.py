import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.member import MemberStatus


class MemberCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: str | None = None
    phone: str | None = None
    has_pt_plan: bool = False
    join_date: date | None = None


class MemberUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    email: str | None = None
    phone: str | None = None
    status: MemberStatus | None = None
    has_pt_plan: bool | None = None
    assigned_trainer_id: uuid.UUID | None = None


class MemberRead(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str | None
    phone: str | None
    status: MemberStatus
    has_pt_plan: bool
    assigned_trainer_id: uuid.UUID | None
    join_date: date | None
    created_at: datetime

    model_config = {"from_attributes": True}
