import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { currentTenantApiBaseUrl } from '../../shared/api-config';
import { EntityRow } from '../../shared/entity-page/entity-field.model';
import { StaffRow } from './staff.model';

interface UserResponse {
  id: string;
  email: string;
  role: string | null;
  availability_status: string | null;
  is_active: boolean;
}

function toRow(user: UserResponse): StaffRow {
  return {
    id: user.id,
    email: user.email,
    role: user.role ?? '',
    isActive: user.is_active,
    availabilityStatus: user.availability_status,
  };
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient);

  private readonly rowsSignal = signal<StaffRow[]>([]);
  readonly rows = this.rowsSignal.asReadonly();

  async load(): Promise<void> {
    const users = await firstValueFrom(
      this.http.get<UserResponse[]>(`${currentTenantApiBaseUrl()}/users`),
    );
    this.rowsSignal.set(users.map(toRow));
  }

  async create(dto: EntityRow): Promise<void> {
    await firstValueFrom(
      this.http.post(`${currentTenantApiBaseUrl()}/users`, {
        email: dto['email'],
        password: dto['password'],
        role: dto['role'],
      }),
    );
    await this.load();
  }

  async update(id: string, dto: EntityRow): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${currentTenantApiBaseUrl()}/users/${id}`, {
        role: dto['role'],
        is_active: dto['isActive'],
        availability_status: dto['availabilityStatus'] || null,
      }),
    );
    await this.load();
  }
}
