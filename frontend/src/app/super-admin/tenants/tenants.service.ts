import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SUPER_ADMIN_API_BASE_URL } from '../../../shared/api-config';
import { EntityRow } from '../../../shared/entity-page/entity-field.model';
import { TenantRow } from './tenant.model';

interface TenantResponse {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface TenantFeatureStatus {
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
}

function toRow(tenant: TenantResponse): TenantRow {
  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    isActive: tenant.is_active,
    createdAt: new Date(tenant.created_at),
  };
}

@Injectable({ providedIn: 'root' })
export class TenantsService {
  private readonly http = inject(HttpClient);

  private readonly rowsSignal = signal<TenantRow[]>([]);
  readonly rows = this.rowsSignal.asReadonly();

  async load(): Promise<void> {
    const tenants = await firstValueFrom(
      this.http.get<TenantResponse[]>(`${SUPER_ADMIN_API_BASE_URL}/tenants`),
    );
    this.rowsSignal.set(tenants.map(toRow));
  }

  async get(id: string): Promise<TenantRow> {
    const tenant = await firstValueFrom(
      this.http.get<TenantResponse>(`${SUPER_ADMIN_API_BASE_URL}/tenants/${id}`),
    );
    return toRow(tenant);
  }

  async create(dto: EntityRow): Promise<void> {
    await firstValueFrom(
      this.http.post(`${SUPER_ADMIN_API_BASE_URL}/tenants`, {
        slug: dto['slug'],
        name: dto['name'],
        admin_email: dto['adminEmail'],
        admin_password: dto['adminPassword'],
      }),
    );
    await this.load();
  }

  async update(id: string, dto: EntityRow): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${SUPER_ADMIN_API_BASE_URL}/tenants/${id}`, {
        name: dto['name'],
        is_active: dto['isActive'],
      }),
    );
    await this.load();
  }

  listTenantFeatures(tenantId: string): Promise<TenantFeatureStatus[]> {
    return firstValueFrom(
      this.http.get<TenantFeatureStatus[]>(`${SUPER_ADMIN_API_BASE_URL}/tenants/${tenantId}/features`),
    );
  }

  async toggleFeature(tenantId: string, key: string, enabled: boolean): Promise<void> {
    await firstValueFrom(
      this.http.put(`${SUPER_ADMIN_API_BASE_URL}/tenants/${tenantId}/features/${key}`, { enabled }),
    );
  }
}
