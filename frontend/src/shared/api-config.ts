export const SUPER_ADMIN_API_BASE_URL = 'http://admin.lvh.me:8000/api/v1';

// Dev-only stand-ins for what a real deployment gets from a wildcard DNS record
// (*.repstack.com) plus a reverse proxy that forwards any subdomain through --
// lvh.me's wildcard DNS (every subdomain resolves to 127.0.0.1) plays that same
// role locally, so a tenant's URL never needs a per-tenant DNS/hosts-file entry.
export const TENANT_APP_ROOT = 'lvh.me:7200';
export const TENANT_API_ROOT = 'lvh.me:8000';

export function tenantAppUrl(slug: string): string {
  return `http://${slug}.${TENANT_APP_ROOT}`;
}

/** The current tenant's own API base -- derived from whatever host the app is
 * being viewed from, since that host IS the tenant lookup key on the backend. */
export function currentTenantApiBaseUrl(): string {
  const [, port] = TENANT_API_ROOT.split(':');
  return `http://${window.location.hostname}:${port}/api/v1`;
}
