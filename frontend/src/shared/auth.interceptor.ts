import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SUPER_ADMIN_API_BASE_URL } from './api-config';
import { AuthService } from './auth.service';
import { TenantAuthService } from './tenant-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/v1/')) {
    return next(req);
  }

  const token = req.url.startsWith(SUPER_ADMIN_API_BASE_URL)
    ? inject(AuthService).accessToken
    : inject(TenantAuthService).accessToken;

  return next(
    req.clone({
      withCredentials: true,
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  );
};
