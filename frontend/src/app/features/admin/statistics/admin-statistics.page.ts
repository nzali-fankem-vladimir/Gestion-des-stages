import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, GlobalStatistics } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-statistics-page',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Statistiques globales</h1>
      <button 
        class="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
        (click)="loadStatistics()"
      >
        Actualiser
      </button>
    </div>

    <div *ngIf="loading" class="text-center py-8">
      <div class="text-gray-500">Chargement des statistiques...</div>
    </div>

    <div *ngIf="!loading && statistics" class="space-y-6">
      <!-- Statistiques des utilisateurs -->
      <div class="bg-white border rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">Utilisateurs</h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ statistics.users.ETUDIANT }}</div>
            <div class="text-sm text-gray-600">Étudiants</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ statistics.users.ENSEIGNANT }}</div>
            <div class="text-sm text-gray-600">Enseignants</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ statistics.users.ENTREPRISE }}</div>
            <div class="text-sm text-gray-600">Entreprises</div>
          </div>
          <div class="text-center p-4 bg-red-50 rounded-lg">
            <div class="text-2xl font-bold text-red-600">{{ statistics.users.ADMIN }}</div>
            <div class="text-sm text-gray-600">Administrateurs</div>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-gray-600">{{ statistics.users.TOTAL }}</div>
            <div class="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      <!-- Autres statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Candidatures</h3>
          <div class="text-3xl font-bold text-indigo-600">{{ statistics.candidatures.TOTAL }}</div>
          <div class="text-sm text-gray-500">Total des candidatures</div>
        </div>
        
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Offres</h3>
          <div class="text-3xl font-bold text-orange-600">{{ statistics.offres.TOTAL }}</div>
          <div class="text-sm text-gray-500">Total des offres</div>
        </div>
        
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Conventions</h3>
          <div class="text-3xl font-bold text-teal-600">{{ statistics.conventions.TOTAL }}</div>
          <div class="text-sm text-gray-500">Total des conventions</div>
        </div>
      </div>

      <!-- Répartition des rôles -->
      <div class="bg-white border rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">Répartition des rôles</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Étudiants</span>
            <div class="flex items-center gap-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full" 
                  [style.width.%]="getPercentage('ETUDIANT')"
                ></div>
              </div>
              <span class="text-sm text-gray-600">{{ getPercentage('ETUDIANT') }}%</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Enseignants</span>
            <div class="flex items-center gap-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-600 h-2 rounded-full" 
                  [style.width.%]="getPercentage('ENSEIGNANT')"
                ></div>
              </div>
              <span class="text-sm text-gray-600">{{ getPercentage('ENSEIGNANT') }}%</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Entreprises</span>
            <div class="flex items-center gap-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-purple-600 h-2 rounded-full" 
                  [style.width.%]="getPercentage('ENTREPRISE')"
                ></div>
              </div>
              <span class="text-sm text-gray-600">{{ getPercentage('ENTREPRISE') }}%</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Administrateurs</span>
            <div class="flex items-center gap-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-red-600 h-2 rounded-full" 
                  [style.width.%]="getPercentage('ADMIN')"
                ></div>
              </div>
              <span class="text-sm text-gray-600">{{ getPercentage('ADMIN') }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminStatisticsPageComponent implements OnInit {
  statistics: GlobalStatistics | null = null;
  loading = false;

  constructor(
    private adminService: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics() {
    this.loading = true;
    this.adminService.getGlobalStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        this.toast.show('Erreur lors du chargement des statistiques', 'error');
        this.loading = false;
      }
    });
  }

  getPercentage(role: 'ETUDIANT' | 'ENSEIGNANT' | 'ENTREPRISE' | 'ADMIN'): number {
    if (!this.statistics || this.statistics.users.TOTAL === 0) return 0;
    return Math.round((this.statistics.users[role] / this.statistics.users.TOTAL) * 100);
  }
}
