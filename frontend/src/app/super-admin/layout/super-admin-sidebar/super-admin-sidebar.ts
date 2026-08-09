import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2 } from '@ng-icons/lucide';
import { LayoutState } from '../../../../shared/layout-state.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-super-admin-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [provideIcons({ lucideBuilding2 })],
  templateUrl: './super-admin-sidebar.html',
  styleUrl: './super-admin-sidebar.scss',
})
export class SuperAdminSidebar {
  protected readonly layoutState = inject(LayoutState);

  protected readonly navItems: NavItem[] = [
    { label: 'Tenants', route: '/super-admin/tenants', icon: 'lucideBuilding2' },
  ];
}
