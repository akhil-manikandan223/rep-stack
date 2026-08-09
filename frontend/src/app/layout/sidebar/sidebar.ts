import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideLayoutDashboard, lucideX } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LayoutState } from '../../../shared/layout-state.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon, HlmButtonImports],
  providers: [provideIcons({ lucideDumbbell, lucideLayoutDashboard, lucideX })],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  protected readonly layoutState = inject(LayoutState);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'lucideLayoutDashboard' },
    { label: 'Equipment', route: '/equipments', icon: 'lucideDumbbell' },
  ];
}
