import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideLayoutDashboard, lucideUsers, lucideUserCog, lucideX } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LayoutState } from '../../../shared/layout-state.service';
import { TenantAuthService } from '../../../shared/tenant-auth.service';
import { TenantFeaturesService } from '../../../shared/tenant-features.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  /** Only shown when this feature is enabled for the tenant. Omit to always show. */
  featureKey?: string;
  /** Only shown to these roles. Omit to show to any logged-in staff role. */
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'lucideLayoutDashboard' },
  {
    label: 'Equipment',
    route: '/equipments',
    icon: 'lucideDumbbell',
    featureKey: 'equipment_tracking',
    roles: ['tenant_admin', 'personal_trainer', 'front_desk'],
  },
  { label: 'Staff', route: '/staff', icon: 'lucideUserCog', roles: ['tenant_admin', 'front_desk'] },
  { label: 'Members', route: '/members', icon: 'lucideUsers' },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon, HlmButtonImports],
  providers: [provideIcons({ lucideDumbbell, lucideLayoutDashboard, lucideUsers, lucideUserCog, lucideX })],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  protected readonly layoutState = inject(LayoutState);
  private readonly featuresService = inject(TenantFeaturesService);
  private readonly authService = inject(TenantAuthService);

  protected readonly navItems = computed(() => {
    const role = this.authService.currentUser()?.role;
    return NAV_ITEMS.filter(
      (item) =>
        (!item.featureKey || this.featuresService.has(item.featureKey)) &&
        (!item.roles || (role != null && item.roles.includes(role))),
    );
  });
}
