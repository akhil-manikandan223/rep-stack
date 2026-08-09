import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucideMenu } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthService } from '../../../../shared/auth.service';
import { LayoutState } from '../../../../shared/layout-state.service';

@Component({
  selector: 'app-super-admin-topbar',
  imports: [HlmButtonImports, HlmAvatarImports, NgIcon],
  providers: [provideIcons({ lucideMenu, lucideLogOut })],
  templateUrl: './super-admin-topbar.html',
  styleUrl: './super-admin-topbar.scss',
})
export class SuperAdminTopbar {
  protected readonly layoutState = inject(LayoutState);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/super-admin/login');
  }
}
