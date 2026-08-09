from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.base import AsyncSessionLocal
from app.models.tenant import Tenant

RESERVED_SLUGS = {"admin", "www", "api"}


def extract_slug(host: str, root_domain: str) -> str | None:
    """Returns the tenant slug from a Host header, or None for the admin/no-tenant context."""
    host = host.split(":")[0].lower()
    root_domain = root_domain.lower()

    if host in (root_domain, "localhost", "127.0.0.1"):
        return None

    for suffix in (f".{root_domain}", ".localhost"):
        if host.endswith(suffix):
            slug = host[: -len(suffix)]
            return None if slug in RESERVED_SLUGS else slug

    return None


async def get_raw_db():
    """A DB session with no tenant RLS variable set — only for looking up the (global,
    non-tenant-scoped) tenants table itself during tenant resolution."""
    async with AsyncSessionLocal() as session:
        yield session


async def resolve_tenant(
    request: Request, raw_db: AsyncSession = Depends(get_raw_db)
) -> Tenant | None:
    """Resolves the tenant from the request's Host header. Returns None for the
    super-admin/no-tenant context (reserved subdomains, or the bare root domain)."""
    settings = get_settings()
    host = request.headers.get("host", "")
    slug = extract_slug(host, settings.root_domain)

    if slug is None:
        return None

    result = await raw_db.execute(select(Tenant).where(Tenant.slug == slug))
    tenant = result.scalar_one_or_none()
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unknown tenant '{slug}'")
    if not tenant.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This tenant is inactive")
    return tenant
