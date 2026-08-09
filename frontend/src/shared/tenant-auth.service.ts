import { Injectable } from '@angular/core';
import { currentTenantApiBaseUrl } from './api-config';
import { BaseAuthService } from './base-auth.service';

@Injectable({ providedIn: 'root' })
export class TenantAuthService extends BaseAuthService {
  protected apiBaseUrl(): string {
    return currentTenantApiBaseUrl();
  }
}
