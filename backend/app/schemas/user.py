import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import StaffAvailability, UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    role: UserRole


class UserUpdate(BaseModel):
    role: UserRole | None = None
    is_active: bool | None = None
    availability_status: StaffAvailability | None = None


class UserRead(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID | None
    email: str
    role: UserRole | None
    availability_status: StaffAvailability | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
