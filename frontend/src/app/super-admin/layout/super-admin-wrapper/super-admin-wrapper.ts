import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SuperAdminSidebar } from '../super-admin-sidebar/super-admin-sidebar';
import { SuperAdminTopbar } from '../super-admin-topbar/super-admin-topbar';

@Component({
  selector: 'app-super-admin-wrapper',
  imports: [RouterOutlet, SuperAdminTopbar, SuperAdminSidebar],
  templateUrl: './super-admin-wrapper.html',
  styleUrl: './super-admin-wrapper.scss',
})
export class SuperAdminWrapper {}
