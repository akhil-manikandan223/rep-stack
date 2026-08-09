import pytest


async def _login(client, email: str, password: str = "AdminPass123") -> str:
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_tenant_cannot_see_another_tenants_users(make_client, create_tenant):
    await create_tenant("iso-tenant-a", "Tenant A", "admin@tenanta.com")
    await create_tenant("iso-tenant-b", "Tenant B", "admin@tenantb.com")

    async with make_client("iso-tenant-a.lvh.me") as client_a:
        token_a = await _login(client_a, "admin@tenanta.com")
        client_a.headers["Authorization"] = f"Bearer {token_a}"
        await client_a.post(
            "/api/v1/users", json={"email": "coach@tenanta.com", "password": "CoachPass123", "role": "trainer"}
        )

    async with make_client("iso-tenant-b.lvh.me") as client_b:
        token_b = await _login(client_b, "admin@tenantb.com")
        client_b.headers["Authorization"] = f"Bearer {token_b}"
        resp = await client_b.get("/api/v1/users")
        assert resp.status_code == 200
        emails = {row["email"] for row in resp.json()}
        # Only tenant B's own admin -- never tenant A's admin or coach.
        assert emails == {"admin@tenantb.com"}


@pytest.mark.asyncio
async def test_tenant_admin_cannot_create_a_user_visible_to_another_tenant(make_client, create_tenant):
    tenant_a = await create_tenant("gym-a", "Gym A", "admin@gyma.com")
    await create_tenant("gym-b", "Gym B", "admin@gymb.com")

    async with make_client("gym-a.lvh.me") as client_a:
        token_a = await _login(client_a, "admin@gyma.com")
        client_a.headers["Authorization"] = f"Bearer {token_a}"
        resp = await client_a.post(
            "/api/v1/users",
            json={"email": "frontdesk@gyma.com", "password": "DeskPass123", "role": "front_desk"},
        )
        assert resp.status_code == 201
        created_user_id = resp.json()["id"]

    async with make_client("gym-b.lvh.me") as client_b:
        token_b = await _login(client_b, "admin@gymb.com")
        client_b.headers["Authorization"] = f"Bearer {token_b}"
        resp = await client_b.get("/api/v1/users")
        emails = {row["email"] for row in resp.json()}
        assert "frontdesk@gyma.com" not in emails
        assert created_user_id not in {row["id"] for row in resp.json()}
        assert tenant_a["slug"] == "gym-a"


@pytest.mark.asyncio
async def test_super_admin_sees_users_across_all_tenants(admin_client, create_tenant):
    await create_tenant("multi-a", "Multi A", "admin@multia.com")
    await create_tenant("multi-b", "Multi B", "admin@multib.com")

    tenants = (await admin_client.get("/api/v1/tenants")).json()
    tenant_ids = {t["slug"]: t["id"] for t in tenants}

    users_a = (await admin_client.get(f"/api/v1/tenants/{tenant_ids['multi-a']}/users")).json()
    users_b = (await admin_client.get(f"/api/v1/tenants/{tenant_ids['multi-b']}/users")).json()

    assert {u["email"] for u in users_a} == {"admin@multia.com"}
    assert {u["email"] for u in users_b} == {"admin@multib.com"}
