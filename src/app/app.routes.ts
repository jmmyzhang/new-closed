import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./features/upload/new.component').then(m => m.NewComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'u/:username',
    loadComponent: () => import('./features/profile/public-profile.component').then(m => m.PublicProfileComponent)
  },
  {
    path: 'u/:username/item/:id',
    loadComponent: () => import('./features/item-detail/item-detail.component').then(m => m.ItemDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup.component').then(m => m.SignupComponent)
  },
  { path: '**', redirectTo: '' }
];
