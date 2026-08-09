import { Injectable } from '@angular/core';
import { SUPER_ADMIN_API_BASE_URL } from './api-config';
import { BaseAuthService } from './base-auth.service';

export type { CurrentUser } from './base-auth.service';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseAuthService {
  protected apiBaseUrl(): string {
    return SUPER_ADMIN_API_BASE_URL;
  }
}
