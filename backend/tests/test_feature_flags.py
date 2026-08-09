import pytest


@pytest.mark.asyncio
async def test_super_admin_can_list_feature_catalog_and_toggle_it_for_a_tenant(admin_client, create_tenant):
    tenant = await create_tenant("flagged-gym", "Flagged Gym", "admin@flaggedgym.com")

    features = (await admin_client.get("/api/v1/tenants/features")).json()
    keys = {f["key"] for f in features}
    assert "class_scheduling" in keys

    resp = await admin_client.put(
        f"/api/v1/tenants/{tenant['id']}/features/class_scheduling", json={"enabled": True}
    )
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_toggling_an_unknown_feature_key_404s(admin_client, create_tenant):
    tenant = await create_tenant("another-gym", "Another Gym", "admin@anothergym.com")

    resp = await admin_client.put(
        f"/api/v1/tenants/{tenant['id']}/features/not-a-real-feature", json={"enabled": True}
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_toggling_a_feature_for_an_unknown_tenant_404s(admin_client):
    resp = await admin_client.put(
        "/api/v1/tenants/00000000-0000-0000-0000-000000000000/features/class_scheduling",
        json={"enabled": True},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_non_super_admin_cannot_toggle_features(make_client, create_tenant):
    await create_tenant("regular-gym", "Regular Gym", "admin@regulargym.com")

    async with make_client("regular-gym.lvh.me") as client:
        login = await client.post(
            "/api/v1/auth/login", json={"email": "admin@regulargym.com", "password": "AdminPass123"}
        )
        client.headers["Authorization"] = f"Bearer {login.json()['access_token']}"

        resp = await client.get("/api/v1/tenants")
        assert resp.status_code == 403
