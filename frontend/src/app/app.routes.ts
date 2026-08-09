import { Routes } from '@angular/router';
import { SiteWrapperContainer } from './layout/site-wrapper-container/site-wrapper-container';

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
    path: '',
    component: SiteWrapperContainer,
    children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        {
            path: 'dashboard',
            loadComponent: () => import('./home/dashboard/dashboard').then((m) => m.Dashboard),
        }
    ]
  },
  { path: '**', redirectTo: 'login' },
];
