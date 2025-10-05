import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../shared/services/toast.service';
import { ConventionService, ConventionDto } from '../../../core/services/convention.service';
import { Router } from '@angular/router';

interface AdminConventionView {
  id: number;
  etudiant: string;
  entreprise: string;
  enseignant: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'TERMINEE';
  description?: string;
}

@Component({
  selector: 'app-admin-conventions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Gestion des conventions</h1>
        <div class="text-sm text-gray-500">
          Total: {{ conventions.length }} conventions
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white border rounded-lg p-4">
        <div class="flex gap-4">
          <select class="border rounded px-3 py-2" (change)="filterByStatus($event)">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="APPROUVEE">Approuvée</option>
            <option value="REJETEE">Rejetée</option>
            <option value="TERMINEE">Terminée</option>
          </select>
          <input 
            type="text" 
            placeholder="Rechercher..." 
            class="border rounded px-3 py-2 flex-1"
            (input)="searchConventions($event)"
          />
        </div>
      </div>

      <!-- Liste des conventions -->
      <div class="bg-white border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Convention
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let convention of filteredConventions" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ convention.titre }}</div>
                    <div class="text-sm text-gray-500">ID: {{ convention.id }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ convention.etudiant }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ convention.entreprise }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ formatDate(convention.dateDebut) }} - {{ formatDate(convention.dateFin) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                        [ngClass]="getStatusBadgeClass(convention.statut)">
                    {{ getStatusLabel(convention.statut) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button 
                      class="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      (click)="viewConvention(convention)"
                      type="button"
                    >
                      Voir
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-500">Chargement des conventions...</p>
        </div>
        
        <div *ngIf="!loading && filteredConventions.length === 0" class="text-center py-8 text-gray-500">
          Aucune convention trouvée
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">En attente</div>
          <div class="text-2xl font-semibold text-yellow-600">{{ getCountByStatus('EN_ATTENTE') }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Approuvées</div>
          <div class="text-2xl font-semibold text-green-600">{{ getCountByStatus('APPROUVEE') }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Rejetées</div>
          <div class="text-2xl font-semibold text-red-600">{{ getCountByStatus('REJETEE') }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Terminées</div>
          <div class="text-2xl font-semibold text-blue-600">{{ getCountByStatus('TERMINEE') }}</div>
        </div>
      </div>
    </div>
  `
})
export class AdminConventionsPageComponent implements OnInit {
  conventions: AdminConventionView[] = [];
  filteredConventions: AdminConventionView[] = [];
  loading = false;

  constructor(
    private toast: ToastService,
    private conventionService: ConventionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadConventions();
  }

  loadConventions() {
    this.loading = true;
    this.conventionService.getAll().subscribe({
      next: (conventions) => {
        this.conventions = this.mapConventionsToAdminView(conventions);
        this.filteredConventions = [...this.conventions];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des conventions:', err);
        this.toast.show('Erreur lors du chargement des conventions', 'error');
        this.loading = false;
      }
    });
  }

  private mapConventionsToAdminView(conventions: ConventionDto[]): AdminConventionView[] {
    return conventions.map(conv => ({
      id: conv.id || 0,
      titre: conv.titre || 'Convention sans titre',
      etudiant: 'Étudiant', // TODO: Récupérer le nom de l'étudiant
      entreprise: 'Entreprise', // TODO: Récupérer le nom de l'entreprise
      enseignant: 'Enseignant', // TODO: Récupérer le nom de l'enseignant
      dateDebut: conv.createdAt || '',
      dateFin: '', // TODO: Récupérer la date de fin
      statut: this.mapStatutFromBackend(conv.statut),
      description: conv.description
    }));
  }

  private mapStatutFromBackend(statut?: string): 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'TERMINEE' {
    switch (statut?.toUpperCase()) {
      case 'APPROUVEE':
      case 'APPROVED':
        return 'APPROUVEE';
      case 'REJETEE':
      case 'REJECTED':
        return 'REJETEE';
      case 'TERMINEE':
      case 'COMPLETED':
        return 'TERMINEE';
      default:
        return 'EN_ATTENTE';
    }
  }

  filterByStatus(event: any) {
    const status = event.target.value;
    if (status) {
      this.filteredConventions = this.conventions.filter(conv => conv.statut === status);
    } else {
      this.filteredConventions = [...this.conventions];
    }
  }

  searchConventions(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredConventions = this.conventions.filter(conv => 
      conv.titre.toLowerCase().includes(query) ||
      conv.etudiant.toLowerCase().includes(query) ||
      conv.entreprise.toLowerCase().includes(query)
    );
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'APPROUVEE': 'Approuvée',
      'REJETEE': 'Rejetée',
      'TERMINEE': 'Terminée'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'APPROUVEE': 'bg-green-100 text-green-800',
      'REJETEE': 'bg-red-100 text-red-800',
      'TERMINEE': 'bg-blue-100 text-blue-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getCountByStatus(status: string): number {
    return this.conventions.filter(conv => conv.statut === status).length;
  }

  viewConvention(convention: AdminConventionView) {
    console.log('viewConvention appelé pour:', convention);
    alert(`Bouton Voir cliqué pour la convention: ${convention.titre}`); // Test simple
    // Navigation vers la page de détail de la convention
    this.router.navigate(['/admin/conventions', convention.id]);
    this.toast.show(`Consultation de la convention: ${convention.titre}`, 'info');
  }
}
