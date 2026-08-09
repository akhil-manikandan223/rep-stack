import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantAuthService } from './tenant-auth.service';
import { TenantFeaturesService } from './tenant-features.service';

export const tenantAuthGuard: CanActivateFn = async () => {
  const auth = inject(TenantAuthService);
  const features = inject(TenantFeaturesService);
  const router = inject(Router);

  await auth.whenReady();

  if (auth.currentUser()) {
    await features.load();
    return true;
  }
  return router.createUrlTree(['/login']);
};
