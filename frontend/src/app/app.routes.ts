import { Routes } from '@angular/router';
import { DashboardComponent } from './core/layout/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    pathMatch: 'full', 
    redirectTo: 'login'
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] 
  },
  { path: 'admin', redirectTo: 'admin/users' },
  { path: 'admin/users', canActivate: [authGuard], loadComponent: () => import('./features/admin/users/admin-users.page').then(m => m.AdminUsersPageComponent) },
  { path: 'admin/statistics', canActivate: [authGuard], loadComponent: () => import('./features/admin/statistics/admin-statistics.page').then(m => m.AdminStatisticsPageComponent) },
  { path: 'admin/logs', canActivate: [authGuard], loadComponent: () => import('./features/admin/logs/admin-logs.page').then(m => m.AdminLogsPageComponent) },
  { path: 'admin/offres', canActivate: [authGuard], loadComponent: () => import('./features/admin/offres/admin-offres.page').then(m => m.AdminOffresPageComponent) },
  { path: 'admin/conventions', canActivate: [authGuard], loadComponent: () => import('./features/admin/conventions/admin-conventions.page').then(m => m.AdminConventionsPageComponent) },
  { path: 'admin/roles', canActivate: [authGuard], loadComponent: () => import('./features/admin/roles/admin-roles.page').then(m => m.AdminRolesPageComponent) },
  { path: 'etudiant', loadComponent: () => import('./features/etudiant/etudiant-dashboard.page').then(m => m.EtudiantDashboardPageComponent), canActivate: [authGuard] },
  { path: 'candidatures', canActivate: [authGuard], loadComponent: () => import('./features/etudiant/candidatures.page').then(m => m.CandidaturesPageComponent) },
  { path: 'rapports', canActivate: [authGuard], loadComponent: () => import('./features/rapports/rapports-enhanced.page').then(m => m.RapportsEnhancedPageComponent) },
  { path: 'etudiant/rapports-hebdomadaires', canActivate: [authGuard], loadComponent: () => import('./features/rapports-hebdomadaires/rapports-hebdomadaires.page').then(m => m.RapportsHebdomadairesPageComponent) },
  { path: 'etudiant/profil', canActivate: [authGuard], loadComponent: () => import('./features/etudiant/profil.page').then(m => m.EtudiantProfilPageComponent) },
  { path: 'etudiant/offres', canActivate: [authGuard], loadComponent: () => import('./features/etudiant/offres.page').then(m => m.EtudiantOffresPageComponent) },
  { path: 'etudiant/conventions', canActivate: [authGuard], loadComponent: () => import('./features/etudiant/index').then(m => m.EtudiantConventionsPageComponent) },
  { path: 'enseignant', redirectTo: 'dashboard' },
  { path: 'enseignant/profil', canActivate: [authGuard], loadComponent: () => import('./features/enseignant/index').then(m => m.EnseignantProfilPageComponent) },
  { path: 'enseignant/conventions', canActivate: [authGuard], loadComponent: () => import('./features/enseignant/index').then(m => m.EnseignantConventionsPageComponent) },
  { path: 'enseignant/rapports', canActivate: [authGuard], loadComponent: () => import('./features/enseignant/index').then(m => m.EnseignantRapportsPageComponent) },
  { path: 'enseignant/rapports-validation', canActivate: [authGuard], loadComponent: () => import('./features/enseignant/rapports-validation.page').then(m => m.RapportsValidationPageComponent) },
  { path: 'entreprise', redirectTo: 'offres' },
  
  // Routes entreprise
  { path: 'offres', canActivate: [authGuard], loadComponent: () => import('./features/entreprise/offres.page').then(m => m.EntrepriseOffresPageComponent) },
  { path: 'offres/nouvelle', canActivate: [authGuard], loadComponent: () => import('./features/entreprise/offre-form.page').then(m => m.OffreFormPageComponent) },
  { path: 'offres/:id/modifier', canActivate: [authGuard], loadComponent: () => import('./features/entreprise/offre-form.page').then(m => m.OffreFormPageComponent) },
  { path: 'candidatures-recues', canActivate: [authGuard], loadComponent: () => import('./features/entreprise/candidatures-recues.page').then(m => m.CandidaturesRecuesPageComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPageComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.page').then(m => m.RegisterPageComponent) },
  { path: 'notifications', canActivate: [authGuard], loadComponent: () => import('./features/notifications/notifications.page').then(m => m.NotificationsPageComponent) },
  { path: 'messages', canActivate: [authGuard], loadComponent: () => import('./features/messages/messages.page').then(m => m.MessagesPageComponent) },
  { path: 'etudiant/messages', canActivate: [authGuard], loadComponent: () => import('./features/etudiant/messages.page').then(m => m.EtudiantMessagesPageComponent) },
  { path: 'entreprise/conventions', canActivate: [authGuard], loadComponent: () => import('./features/entreprise/conventions.page').then(m => m.ConventionsPageComponent) },
  
  { path: 'entreprise/profil', canActivate: [authGuard], loadComponent: () => import('./features/entreprise/profil.page').then(m => m.EntrepriseProfilPageComponent) },
];
