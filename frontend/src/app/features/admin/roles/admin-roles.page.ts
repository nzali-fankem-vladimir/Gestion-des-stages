import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../shared/services/toast.service';
import { AdminService } from '../../../core/services/admin.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6" [class.opacity-50]="loading" [class.pointer-events-none]="loading">
  <div *ngIf="loading" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-center">Chargement en cours...</p>
    </div>
  </div>
      <h1 class="text-2xl font-bold">Gestion des rôles et permissions</h1>

      <!-- Résumé des rôles -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm text-gray-500">Étudiants</div>
              <div class="text-2xl font-semibold text-blue-600">{{ userStats.ETUDIANT || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white border rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-green-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm text-gray-500">Enseignants</div>
              <div class="text-2xl font-semibold text-green-600">{{ userStats.ENSEIGNANT || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white border rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-purple-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m-.75 3h.75M9 21v-7.5" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm text-gray-500">Entreprises</div>
              <div class="text-2xl font-semibold text-purple-600">{{ userStats.ENTREPRISE || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white border rounded-lg p-6">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-red-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm text-gray-500">Administrateurs</div>
              <div class="text-2xl font-semibold text-red-600">{{ userStats.ADMIN || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Matrice des permissions -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-medium mb-4">Matrice des permissions</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4">Permission</th>
                <th class="text-center py-3 px-4">Étudiant</th>
                <th class="text-center py-3 px-4">Enseignant</th>
                <th class="text-center py-3 px-4">Entreprise</th>
                <th class="text-center py-3 px-4">Admin</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr>
                <td class="py-3 px-4 font-medium">Voir les offres</td>
                <td class="text-center py-3 px-4">✅</td>
                <td class="text-center py-3 px-4">✅</td>
                <td class="text-center py-3 px-4">✅</td>
                <td class="text-center py-3 px-4">✅</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">Créer des candidatures</td>
                <td class="text-center py-3 px-4">✅</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">✅</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">Publier des offres</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">✅</td>
                <td class="text-center py-3 px-4">✅</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">Gérer les conventions</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">✅</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">✅</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">Voir tous les utilisateurs</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">✅</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">Supprimer des utilisateurs</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">✅</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">Voir les statistiques</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">❌</td>
                <td class="text-center py-3 px-4">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actions administratives -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-medium mb-4">Actions administratives</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            class="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            (click)="exportUsers()"
          >
            <div class="p-2 bg-blue-100 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
            <div>
              <div class="font-medium">Exporter les utilisateurs</div>
              <div class="text-sm text-gray-500">Télécharger la liste complète</div>
            </div>
          </button>
          
          <button 
            class="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            (click)="resetPermissions()"
          >
            <div class="p-2 bg-yellow-100 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-yellow-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            <div>
              <div class="font-medium">Réinitialiser les permissions</div>
              <div class="text-sm text-gray-500">Restaurer les paramètres par défaut</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminRolesPageComponent implements OnInit {
  loading = false;
  userStats = {
    ETUDIANT: 0,
    ENSEIGNANT: 0,
    ENTREPRISE: 0,
    ADMIN: 0
  };

  constructor(
    private toast: ToastService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.loadUserStatistics();
  }

  private loadUserStatistics() {
    this.loading = true;
    this.adminService.getUserStatistics()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (stats) => {
          this.userStats = {
            ETUDIANT: stats.ETUDIANT || 0,
            ENSEIGNANT: stats.ENSEIGNANT || 0,
            ENTREPRISE: stats.ENTREPRISE || 0,
            ADMIN: stats.ADMIN || 0
          };
        },
        error: (err) => {
          console.error('Erreur lors du chargement des statistiques', err);
          this.toast.show('Erreur lors du chargement des statistiques', 'error');
        }
      });
  }

  exportUsers() {
    this.loading = true;
    this.toast.show('Export des utilisateurs en cours...', 'info');
    
    this.adminService.getAllUsers()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (users) => {
          // Créer un fichier CSV
          const headers = ['ID', 'Email', 'Rôle', 'Date de création', 'Statut'];
          const csvContent = [
            headers.join(';'),
            ...users.map(user => [
              user.id,
              `"${user.email}"`,
              user.role,
              user.createdAt ? new Date(user.createdAt).toLocaleString('fr-FR') : 'N/A',
              user.actif ? 'Actif' : 'Inactif'
            ].join(';'))
          ].join('\n');

          // Télécharger le fichier
          const blob = new Blob([
            '\ufeff', // BOM pour l'UTF-8
            csvContent
          ], { type: 'text/csv;charset=utf-8;' });
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          this.toast.show('Export des utilisateurs terminé', 'success');
        },
        error: (err) => {
          console.error('Erreur lors de l\'export des utilisateurs', err);
          this.toast.show('Erreur lors de l\'export des utilisateurs', 'error');
        }
      });
  }

  resetPermissions() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les permissions ? Cette action est irréversible.')) {
      this.loading = true;
      
      // Simuler un appel API (à remplacer par un vrai appel)
      setTimeout(() => {
        this.loading = false;
        this.toast.show('Les permissions ont été réinitialisées avec succès', 'success');
      }, 1500);
      
      // TODO: Implémenter la réinitialisation côté serveur
      // this.adminService.resetPermissions().subscribe({
      //   next: () => {
      //     this.loading = false;
      //     this.toast.show('Les permissions ont été réinitialisées avec succès', 'success');
      //   },
      //   error: (err) => {
      //     this.loading = false;
      //     console.error('Erreur lors de la réinitialisation des permissions', err);
      //     this.toast.show('Erreur lors de la réinitialisation des permissions', 'error');
      //   }
      // });
    }
  }
}
