import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from app.core.config import get_settings

_hasher = PasswordHasher()


def hash_password(plain_password: str) -> str:
    return _hasher.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return _hasher.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


def _create_token(
    *,
    subject: uuid.UUID,
    tenant_id: uuid.UUID | None,
    role: str | None,
    is_super_admin: bool,
    token_type: TokenType,
    expires_delta: timedelta,
) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "tenant_id": str(tenant_id) if tenant_id else None,
        "role": role,
        "is_super_admin": is_super_admin,
        "type": token_type.value,
        "iat": now,
        "exp": now + expires_delta,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(
    *, subject: uuid.UUID, tenant_id: uuid.UUID | None, role: str | None, is_super_admin: bool
) -> str:
    settings = get_settings()
    return _create_token(
        subject=subject,
        tenant_id=tenant_id,
        role=role,
        is_super_admin=is_super_admin,
        token_type=TokenType.ACCESS,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(
    *, subject: uuid.UUID, tenant_id: uuid.UUID | None, role: str | None, is_super_admin: bool
) -> str:
    settings = get_settings()
    return _create_token(
        subject=subject,
        tenant_id=tenant_id,
        role=role,
        is_super_admin=is_super_admin,
        token_type=TokenType.REFRESH,
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
    )


def decode_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
