import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../../shared/services/toast.service';
import { OffreService, OffreDto } from '../../../core/services/offre.service';

interface AdminOffreView {
  id: number;
  titre: string;
  entreprise: string;
  description: string;
  datePublication: string;
  dateExpiration: string;
  statut: 'ACTIVE' | 'EXPIREE' | 'SUSPENDUE';
  candidatures: number;
  estActive: boolean;
}

@Component({
  selector: 'app-admin-offres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
    /* Styles pour modal SANS backdrop */
    :host ::ng-deep .offre-details-modal-no-backdrop .modal-backdrop {
      display: none !important; /* Suppression complète du backdrop */
    }
    
    :host ::ng-deep .offre-details-modal-no-backdrop .modal-dialog {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
      border-radius: 0.75rem;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      background: white;
    }
    
    /* Ajustements pour les petits écrans */
    @media (max-width: 768px) {
      :host ::ng-deep .offre-details-modal-no-backdrop .modal-dialog {
        margin: 1rem;
        max-width: calc(100% - 2rem);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1);
      }
    }
    `
  ],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Gestion des offres</h1>
        <div class="text-sm text-gray-500">
          Total: {{ offres.length }} offres
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white border rounded-lg p-4">
        <div class="flex gap-4">
          <select class="border rounded px-3 py-2" (change)="filterByStatus($event)">
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIREE">Expirée</option>
            <option value="SUSPENDUE">Suspendue</option>
          </select>
          <input 
            type="text" 
            placeholder="Rechercher par titre ou entreprise..." 
            class="border rounded px-3 py-2 flex-1"
            (input)="searchOffres($event)"
          />
        </div>
      </div>

      <!-- Liste des offres -->
      <div class="bg-white border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offre
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publication
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidatures
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
              <tr *ngFor="let offre of filteredOffres" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ offre.titre }}</div>
                    <div class="text-sm text-gray-500">{{ offre.description | slice:0:100 }}...</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ offre.entreprise }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(offre.datePublication) }}</div>
                  <div class="text-sm text-gray-500">Expire: {{ formatDate(offre.dateExpiration) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ offre.candidatures }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                        [ngClass]="getStatusBadgeClass(offre.statut)">
                    {{ getStatusLabel(offre.statut) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button 
                      class="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      (click)="viewOffre(offre)"
                      type="button"
                    >
                      Voir
                    </button>
                    <button 
                      class="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      (click)="deleteOffre(offre)"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-500">Chargement des offres...</p>
        </div>
        
        <div *ngIf="!loading && filteredOffres.length === 0" class="text-center py-8 text-gray-500">
          Aucune offre trouvée
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Offres actives</div>
          <div class="text-2xl font-semibold text-green-600">{{ getCountByStatus('ACTIVE') }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Offres expirées</div>
          <div class="text-2xl font-semibold text-red-600">{{ getCountByStatus('EXPIREE') }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Offres suspendues</div>
          <div class="text-2xl font-semibold text-yellow-600">{{ getCountByStatus('SUSPENDUE') }}</div>
        </div>
      </div>
    </div>

    <!-- Modale des détails de l'offre -->
    <ng-template #offreDetailsModal let-modal>
      <div class="modal-header bg-purple-600 text-white flex justify-between items-center px-6 py-4">
        <h4 class="text-lg font-semibold text-white">Détails de l'offre</h4>
        <button type="button" 
                class="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all" 
                (click)="closeModal(modal)" 
                aria-label="Fermer"
                title="Fermer">
          ×
        </button>
      </div>
      
      <div class="modal-body p-6" *ngIf="selectedOffre">
        <!-- En-tête avec titre et entreprise -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h5 class="text-xl font-bold text-gray-900 mb-2">{{ selectedOffre.titre }}</h5>
              <p class="text-lg text-gray-600 mb-3">{{ selectedOffre.entreprise }}</p>
              <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full" 
                    [ngClass]="getStatusBadgeClass(selectedOffre.statut)">
                {{ getStatusLabel(selectedOffre.statut) }}
              </span>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Candidatures</div>
              <div class="text-2xl font-bold text-purple-600">{{ selectedOffre.candidatures }}</div>
            </div>
          </div>
        </div>

        <!-- Description complète -->
        <div class="mb-6">
          <h6 class="text-sm font-medium text-gray-500 mb-2">Description</h6>
          <div class="bg-white border rounded-lg p-4">
            <p class="text-gray-900 whitespace-pre-wrap">{{ selectedOffre.description || 'Aucune description disponible' }}</p>
          </div>
        </div>

        <!-- Informations détaillées -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">ID Offre</label>
            <p class="text-gray-900">#{{ selectedOffre.id }}</p>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Statut</label>
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" [ngClass]="getStatusBadgeClass(selectedOffre.statut)">
              {{ getStatusLabel(selectedOffre.statut) }}
            </span>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Date de publication</label>
            <p class="text-gray-900">{{ formatDate(selectedOffre.datePublication) }}</p>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Date d'expiration</label>
            <p class="text-gray-900">{{ formatDate(selectedOffre.dateExpiration) }}</p>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Nombre de candidatures</label>
            <p class="text-gray-900 font-semibold">{{ selectedOffre.candidatures }} candidature(s)</p>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">État</label>
            <p class="text-gray-900">{{ selectedOffre.estActive ? 'Active' : 'Inactive' }}</p>
          </div>
        </div>

        <!-- Actions sur l'offre -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h6 class="text-sm font-medium text-gray-700 mb-3">Actions administrateur</h6>
          <div class="flex flex-wrap gap-2">
            <select class="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm" 
                    [(ngModel)]="selectedOffre.statut"
                    (change)="onStatusChange(selectedOffre.statut)">
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDUE">Suspendue</option>
              <option value="EXPIREE">Expirée</option>
            </select>
            <button class="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
              Voir candidatures
            </button>
            <button class="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
              Modifier
            </button>
          </div>
        </div>
      </div>
      
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-between items-center">
        <div>
          <small class="text-gray-500">ID: #{{ selectedOffre?.id }}</small>
        </div>
        <div class="flex space-x-2">
          <button type="button" 
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors" 
                  (click)="closeModal(modal)">
            Fermer
          </button>
        </div>
      </div>
    </ng-template>

    <!-- Modale de confirmation de suppression -->
    <div *ngIf="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">Supprimer l'offre</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Êtes-vous sûr de vouloir supprimer définitivement l'offre 
              <span class="font-semibold text-gray-700">"{{ offreToDelete?.titre }}"</span> ?
            </p>
            <p class="text-xs text-gray-400 mt-2">
              Cette action est irréversible. Toutes les candidatures associées seront également supprimées.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              (click)="confirmDelete()"
            >
              Supprimer
            </button>
            <button
              class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              (click)="closeDeleteModal()"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminOffresPageComponent implements OnInit {
  @ViewChild('offreDetailsModal') offreDetailsModal!: TemplateRef<any>;
  
  offres: AdminOffreView[] = [];
  filteredOffres: AdminOffreView[] = [];
  selectedOffre: AdminOffreView | null = null;
  loading = false;
  showDeleteModal = false;
  offreToDelete: AdminOffreView | null = null;

  constructor(
    private toast: ToastService,
    private offreService: OffreService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.loadOffres();
  }

  loadOffres() {
    this.loading = true;
    this.offreService.findAll().subscribe({
      next: (offres) => {
        this.offres = this.mapOffresToAdminView(offres);
        this.filteredOffres = [...this.offres];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des offres:', err);
        this.toast.show('Erreur lors du chargement des offres', 'error');
        this.loading = false;
      }
    });
  }

  private mapOffresToAdminView(offres: OffreDto[]): AdminOffreView[] {
    return offres.map(offre => ({
      id: offre.id || 0,
      titre: offre.titre || 'Titre non défini',
      entreprise: 'Entreprise', // TODO: Récupérer le nom de l'entreprise
      description: offre.description || '',
      datePublication: offre.dateDebut || '',
      dateExpiration: offre.dateLimiteCandidature || '',
      statut: this.getStatutFromOffre(offre),
      candidatures: 0, // TODO: Récupérer le nombre de candidatures
      estActive: offre.estActive || false
    }));
  }

  private getStatutFromOffre(offre: OffreDto): 'ACTIVE' | 'EXPIREE' | 'SUSPENDUE' {
    if (!offre.estActive) return 'SUSPENDUE';
    if (offre.dateLimiteCandidature && new Date(offre.dateLimiteCandidature) < new Date()) {
      return 'EXPIREE';
    }
    return 'ACTIVE';
  }

  filterByStatus(event: any) {
    const status = event.target.value;
    if (status) {
      this.filteredOffres = this.offres.filter(offre => offre.statut === status);
    } else {
      this.filteredOffres = [...this.offres];
    }
  }

  searchOffres(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredOffres = this.offres.filter(offre => 
      offre.titre.toLowerCase().includes(query) ||
      offre.entreprise.toLowerCase().includes(query)
    );
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Active',
      'EXPIREE': 'Expirée',
      'SUSPENDUE': 'Suspendue'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'EXPIREE': 'bg-red-100 text-red-800',
      'SUSPENDUE': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getCountByStatus(status: string): number {
    return this.offres.filter(offre => offre.statut === status).length;
  }

  viewOffre(offre: AdminOffreView) {
    console.log('Ouverture des détails pour l\'offre:', offre);
    this.selectedOffre = offre;
    
    // Configuration de la modal sans backdrop
    const modalRef = this.modalService.open(this.offreDetailsModal, {
      size: 'lg',
      backdrop: false,    // Pas d'assombrissement
      keyboard: true,     // Fermeture avec Échap
      centered: true,
      scrollable: true,
      windowClass: 'offre-details-modal-no-backdrop'
    });

    // Gestion de la fermeture
    modalRef.result.then(
      (result) => {
        console.log('Modal fermée avec résultat:', result);
        this.selectedOffre = null;
      },
      (dismissed) => {
        console.log('Modal fermée sans résultat:', dismissed);
        this.selectedOffre = null;
      }
    );
  }

  deleteOffre(offre: AdminOffreView) {
    this.offreToDelete = offre;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.offreToDelete) {
      this.offreService.delete(this.offreToDelete.id).subscribe({
        next: () => {
          this.toast.show(`Offre "${this.offreToDelete!.titre}" supprimée`, 'success');
          this.loadOffres();
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.toast.show('Erreur lors de la suppression', 'error');
          this.closeDeleteModal();
        }
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.offreToDelete = null;
  }

  closeModal(modal: any) {
    console.log('Fermeture de la modal offre...');
    try {
      modal.dismiss('close');
      console.log('Modal fermée avec succès');
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
      modal.close();
    }
    this.selectedOffre = null;
  }

  onStatusChange(newStatus: 'ACTIVE' | 'EXPIREE' | 'SUSPENDUE') {
    if (this.selectedOffre) {
      console.log('Changement de statut:', newStatus);
      this.selectedOffre.statut = newStatus;
      this.toast.show(`Statut de l'offre mis à jour: ${this.getStatusLabel(newStatus)}`, 'success');
      // TODO: Appeler l'API pour sauvegarder le changement
      // this.offreService.updateStatus(this.selectedOffre.id, newStatus).subscribe(...)
    }
  }
}
