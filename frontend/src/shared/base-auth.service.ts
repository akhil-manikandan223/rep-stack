import { HttpClient } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CurrentUser {
  id: string;
  email: string;
  tenantId: string | null;
  role: string | null;
  isSuperAdmin: boolean;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface CurrentUserResponse {
  id: string;
  email: string;
  tenant_id: string | null;
  role: string | null;
  is_super_admin: boolean;
}

export abstract class BaseAuthService {
  protected readonly http = inject(HttpClient);

  private readonly accessTokenSignal = signal<string | null>(null);
  readonly currentUser = signal<CurrentUser | null>(null);

  // Resolves once the initial silent-refresh attempt (constructor) has settled,
  // so guards can wait for it instead of racing an unset currentUser on page load.
  private readonly readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = this.tryRestoreSession();
  }

  /** Base URL of the API this session talks to (e.g. differs per tenant subdomain). */
  protected abstract apiBaseUrl(): string;

  get accessToken(): string | null {
    return this.accessTokenSignal();
  }

  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.apiBaseUrl()}/auth/login`, { email, password }),
    );
    this.accessTokenSignal.set(res.access_token);
    await this.loadCurrentUser();
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.apiBaseUrl()}/auth/logout`, {}));
    } finally {
      this.accessTokenSignal.set(null);
      this.currentUser.set(null);
    }
  }

  private async tryRestoreSession(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.post<TokenResponse>(`${this.apiBaseUrl()}/auth/refresh`, {}),
      );
      this.accessTokenSignal.set(res.access_token);
      await this.loadCurrentUser();
    } catch {
      this.accessTokenSignal.set(null);
      this.currentUser.set(null);
    }
  }

  private async loadCurrentUser(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<CurrentUserResponse>(`${this.apiBaseUrl()}/auth/me`),
    );
    this.currentUser.set({
      id: res.id,
      email: res.email,
      tenantId: res.tenant_id,
      role: res.role,
      isSuperAdmin: res.is_super_admin,
    });
  }
}
