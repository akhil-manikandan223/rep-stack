import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class TenantCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=63, pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=1, max_length=255)
    admin_email: EmailStr
    admin_password: str = Field(min_length=8)


class TenantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    is_active: bool | None = None


class TenantRead(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class FeatureRead(BaseModel):
    key: str
    name: str
    description: str | None

    model_config = {"from_attributes": True}


class TenantFeatureToggle(BaseModel):
    enabled: bool


class TenantFeatureStatus(BaseModel):
    key: str
    name: str
    description: str | None
    enabled: bool
