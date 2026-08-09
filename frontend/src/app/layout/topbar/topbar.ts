import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucideMenu, lucideSearch } from '@ng-icons/lucide';
import { LayoutState } from '../../../shared/layout-state.service';
import { TenantAuthService } from '../../../shared/tenant-auth.service';

@Component({
  selector: 'app-topbar',
  imports: [HlmButtonImports, HlmInputGroupImports, HlmAvatarImports, NgIcon],
  providers: [provideIcons({ lucideMenu, lucideSearch, lucideLogOut })],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  protected readonly layoutState = inject(LayoutState);
  protected readonly authService = inject(TenantAuthService);
  private readonly router = inject(Router);

  protected async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}
