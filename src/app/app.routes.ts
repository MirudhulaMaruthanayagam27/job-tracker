import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/dashboard').then((m) => m.Dashboard), title: 'Dashboard · JobTrack' },
  { path: 'applications', loadComponent: () => import('./pages/applications').then((m) => m.Applications), title: 'Applications · JobTrack' },
  { path: 'applications/new', loadComponent: () => import('./pages/application-form').then((m) => m.ApplicationForm), title: 'New application · JobTrack' },
  { path: 'applications/:id/edit', loadComponent: () => import('./pages/application-form').then((m) => m.ApplicationForm), title: 'Edit application · JobTrack' },
  { path: '**', redirectTo: '' },
];
