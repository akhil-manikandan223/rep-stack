"""Sets up an isolated repstack_test database (own tables + RLS policies, via the
real Alembic migration -- not a stripped-down create_all) before any app module
that opens a DB connection gets imported, so the test suite never touches the
dev database used for manual smoke testing.
"""

import os

os.environ["DATABASE_URL"] = "postgresql+asyncpg://repstack_app:repstack_app@localhost:5434/repstack_test"
os.environ["MIGRATIONS_DATABASE_URL"] = "postgresql+asyncpg://repstack:repstack@localhost:5434/repstack_test"

import asyncio
from pathlib import Path

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import command
from alembic.config import Config

ADMIN_ROOT_URL = "postgresql+asyncpg://repstack:repstack@localhost:5434/postgres"
BACKEND_ROOT = Path(__file__).resolve().parent.parent


async def _recreate_test_database() -> None:
    engine = create_async_engine(ADMIN_ROOT_URL, isolation_level="AUTOCOMMIT")
    async with engine.connect() as conn:
        await conn.execute(text("DROP DATABASE IF EXISTS repstack_test WITH (FORCE)"))
        await conn.execute(text("CREATE DATABASE repstack_test"))
    await engine.dispose()


async def _grant_app_role_privileges() -> None:
    engine = create_async_engine(
        "postgresql+asyncpg://repstack:repstack@localhost:5434/repstack_test",
        isolation_level="AUTOCOMMIT",
    )
    async with engine.connect() as conn:
        await conn.execute(text("GRANT CONNECT ON DATABASE repstack_test TO repstack_app"))
        await conn.execute(text("GRANT USAGE ON SCHEMA public TO repstack_app"))
        await conn.execute(text("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO repstack_app"))
    await engine.dispose()


@pytest_asyncio.fixture(scope="session", autouse=True, loop_scope="session")
async def _test_database():
    await _recreate_test_database()

    alembic_cfg = Config(str(BACKEND_ROOT / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(BACKEND_ROOT / "alembic"))
    # command.upgrade is sync and internally calls asyncio.run() itself (see
    # alembic/env.py) -- calling that directly from here would fail with "asyncio.run()
    # cannot be called from a running event loop", since this fixture is already
    # running inside pytest-asyncio's session loop. Running it in a separate thread
    # gives it a thread with no active loop, avoiding that conflict.
    await asyncio.to_thread(command.upgrade, alembic_cfg, "head")

    await _grant_app_role_privileges()
    yield


@pytest_asyncio.fixture
async def superadmin():
    """Function-scoped, but the underlying test database is session-scoped -- get-or-create
    so re-running this fixture across many tests in one session doesn't hit a duplicate-email
    error on the second test."""
    from sqlalchemy import select

    from app.core.security import hash_password
    from app.db.base import AsyncSessionLocal
    from app.models.user import User

    async with AsyncSessionLocal() as db:
        await db.execute(text("SET LOCAL app.bypass_rls = 'true'"))
        existing = (
            await db.execute(select(User).where(User.email == "super@test.dev"))
        ).scalar_one_or_none()
        if existing is not None:
            return existing

        user = User(email="super@test.dev", hashed_password=hash_password("SuperSecret123"), is_super_admin=True)
        db.add(user)
        await db.commit()
        return user


@pytest.fixture
def make_client():
    from app.main import app

    def _make(host: str) -> AsyncClient:
        return AsyncClient(transport=ASGITransport(app=app), base_url=f"http://{host}:8000")

    return _make


@pytest_asyncio.fixture
async def admin_client(make_client, superadmin):
    async with make_client("admin.lvh.me") as client:
        resp = await client.post(
            "/api/v1/auth/login", json={"email": "super@test.dev", "password": "SuperSecret123"}
        )
        assert resp.status_code == 200, resp.text
        client.headers["Authorization"] = f"Bearer {resp.json()['access_token']}"
        yield client


@pytest.fixture
def create_tenant(admin_client):
    async def _create(slug: str, name: str, admin_email: str, admin_password: str = "AdminPass123") -> dict:
        resp = await admin_client.post(
            "/api/v1/tenants",
            json={"slug": slug, "name": name, "admin_email": admin_email, "admin_password": admin_password},
        )
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _create
