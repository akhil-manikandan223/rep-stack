import { Routes } from '@angular/router';
import { SiteWrapperContainer } from './layout/site-wrapper-container/site-wrapper-container';
import { superAdminGuard } from '../shared/super-admin.guard';
import { tenantAuthGuard } from '../shared/tenant-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./authentication/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./authentication/register/register').then((m) => m.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./authentication/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'super-admin/login',
    loadComponent: () => import('./super-admin/login/login').then((m) => m.SuperAdminLogin),
  },
  {
    path: 'super-admin',
    canActivate: [superAdminGuard],
    loadComponent: () =>
      import('./super-admin/layout/super-admin-wrapper/super-admin-wrapper').then(
        (m) => m.SuperAdminWrapper,
      ),
    children: [
      { path: '', redirectTo: 'tenants', pathMatch: 'full' },
      {
        path: 'tenants',
        loadComponent: () => import('./super-admin/tenants/tenants').then((m) => m.Tenants),
      },
      {
        path: 'tenants/:id',
        loadComponent: () =>
          import('./super-admin/tenants/tenant-detail/tenant-detail').then((m) => m.TenantDetail),
      },
    ],
  },
  {
    path: '',
    component: SiteWrapperContainer,
    canActivate: [tenantAuthGuard],
    children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        {
            path: 'dashboard',
            loadComponent: () => import('./home/dashboard/dashboard').then((m) => m.Dashboard),
        },
        {
            path: 'equipments',
            loadComponent: () => import('./master-data/equipments/equipments').then((m) => m.Equipments),
        },
        {
            path: 'staff',
            loadComponent: () => import('./staff/staff').then((m) => m.Staff),
        },
        {
            path: 'members',
            loadComponent: () => import('./members/members').then((m) => m.Members),
        }
    ]
  },
  { path: '**', redirectTo: 'login' },
];
