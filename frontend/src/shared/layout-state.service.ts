import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutState {
  readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}