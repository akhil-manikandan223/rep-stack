import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { currentTenantApiBaseUrl } from '../../shared/api-config';
import { EntityRow } from '../../shared/entity-page/entity-field.model';
import { MemberRow } from './member.model';

interface MemberResponse {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  has_pt_plan: boolean;
}

function toRow(member: MemberResponse): MemberRow {
  return {
    id: member.id,
    fullName: member.full_name,
    email: member.email,
    phone: member.phone,
    status: member.status,
    hasPtPlan: member.has_pt_plan,
  };
}

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly http = inject(HttpClient);

  private readonly rowsSignal = signal<MemberRow[]>([]);
  readonly rows = this.rowsSignal.asReadonly();

  async load(): Promise<void> {
    const members = await firstValueFrom(
      this.http.get<MemberResponse[]>(`${currentTenantApiBaseUrl()}/members`),
    );
    this.rowsSignal.set(members.map(toRow));
  }

  async create(dto: EntityRow): Promise<void> {
    await firstValueFrom(
      this.http.post(`${currentTenantApiBaseUrl()}/members`, {
        full_name: dto['fullName'],
        email: dto['email'] || null,
        phone: dto['phone'] || null,
        has_pt_plan: dto['hasPtPlan'],
      }),
    );
    await this.load();
  }

  async update(id: string, dto: EntityRow): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${currentTenantApiBaseUrl()}/members/${id}`, {
        full_name: dto['fullName'],
        email: dto['email'] || null,
        phone: dto['phone'] || null,
        status: dto['status'],
        has_pt_plan: dto['hasPtPlan'],
      }),
    );
    await this.load();
  }
}
