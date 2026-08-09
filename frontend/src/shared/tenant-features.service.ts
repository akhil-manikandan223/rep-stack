import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { currentTenantApiBaseUrl } from './api-config';

@Injectable({ providedIn: 'root' })
export class TenantFeaturesService {
  private readonly http = inject(HttpClient);

  private readonly enabledSignal = signal<Set<string>>(new Set());

  async load(): Promise<void> {
    const keys = await firstValueFrom(
      this.http.get<string[]>(`${currentTenantApiBaseUrl()}/features/enabled`),
    );
    this.enabledSignal.set(new Set(keys));
  }

  has(key: string): boolean {
    return this.enabledSignal().has(key);
  }
}
