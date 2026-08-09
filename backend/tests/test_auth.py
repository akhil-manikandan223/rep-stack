import pytest


@pytest.mark.asyncio
async def test_login_with_correct_credentials_succeeds(admin_client):
    resp = await admin_client.get("/api/v1/auth/me")
    assert resp.status_code == 200
    body = resp.json()
    assert body["is_super_admin"] is True
    assert body["tenant_id"] is None


@pytest.mark.asyncio
async def test_login_with_wrong_password_fails(make_client, superadmin):
    async with make_client("admin.lvh.me") as client:
        resp = await client.post(
            "/api/v1/auth/login", json={"email": "super@test.dev", "password": "WrongPassword"}
        )
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_tenant_admin_can_log_in_via_own_subdomain(make_client, create_tenant):
    await create_tenant("acme-gym", "Acme Gym", "admin@acmegym.com")
    async with make_client("acme-gym.lvh.me") as client:
        resp = await client.post(
            "/api/v1/auth/login", json={"email": "admin@acmegym.com", "password": "AdminPass123"}
        )
        assert resp.status_code == 200
        me = await client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {resp.json()['access_token']}"}
        )
        assert me.json()["role"] == "tenant_admin"


@pytest.mark.asyncio
async def test_tenant_admin_cannot_log_in_via_a_different_tenants_subdomain(make_client, create_tenant):
    await create_tenant("tenant-a", "Tenant A", "admin@tenanta.com")
    await create_tenant("tenant-b", "Tenant B", "admin@tenantb.com")

    async with make_client("tenant-b.lvh.me") as client:
        resp = await client.post(
            "/api/v1/auth/login", json={"email": "admin@tenanta.com", "password": "AdminPass123"}
        )
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_super_admin_credentials_are_rejected_on_a_tenant_subdomain(make_client, create_tenant):
    await create_tenant("some-gym", "Some Gym", "admin@somegym.com")

    async with make_client("some-gym.lvh.me") as client:
        resp = await client.post(
            "/api/v1/auth/login", json={"email": "super@test.dev", "password": "SuperSecret123"}
        )
        # The super-admin row's tenant_id is NULL, so no tenant-scoped lookup ever matches it.
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_without_a_token_is_unauthenticated(make_client):
    async with make_client("admin.lvh.me") as client:
        resp = await client.get("/api/v1/auth/me")
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_with_garbage_token_is_rejected(make_client):
    async with make_client("admin.lvh.me") as client:
        resp = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
        assert resp.status_code == 401
