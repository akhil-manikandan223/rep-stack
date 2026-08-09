import { Component, inject } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMenu, lucideSearch } from '@ng-icons/lucide';
import { LayoutState } from '../../../shared/layout-state.service';


@Component({
  selector: 'app-topbar',
  imports: [HlmButtonImports, HlmInputGroupImports, HlmAvatarImports, NgIcon],
  providers: [provideIcons({ lucideMenu, lucideSearch })],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  protected readonly layoutState = inject(LayoutState);
  // protected readonly userService = inject(UserService);
}
