import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OffreService, OffreDto } from '../../core/services/offre.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-entreprise-offres-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto p-6 space-y-6">
      <!-- En-tête -->
      <div class="bg-white rounded-lg border p-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Gestion des offres</h1>
            <p class="text-gray-600">Gérez vos offres de stage</p>
          </div>
          <a routerLink="/offres/nouvelle" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nouvelle offre
          </a>
        </div>
        
        <!-- Filtres -->
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-64">
            <input 
              [(ngModel)]="q" 
              (input)="applyFilters()" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" 
              placeholder="Rechercher par titre, domaine..."
            />
          </div>
          <select [(ngModel)]="sortKey" (change)="applyFilters()" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="id">Trier par: Date</option>
            <option value="titre">Titre</option>
            <option value="domaine">Domaine</option>
          </select>
          <select [(ngModel)]="pageSize" (change)="applyFilters()" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option [ngValue]="10">10 par page</option>
            <option [ngValue]="20">20 par page</option>
            <option [ngValue]="50">50 par page</option>
          </select>
          <button (click)="refresh()" class="border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50">
            Actualiser
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-blue-600">{{ offres.length }}</div>
          <div class="text-sm text-gray-600">Total offres</div>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-green-600">{{ getActiveOffres() }}</div>
          <div class="text-sm text-gray-600">Offres actives</div>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-orange-600">{{ getInactiveOffres() }}</div>
          <div class="text-sm text-gray-600">Offres inactives</div>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-purple-600">{{ getTotalPlaces() }}</div>
          <div class="text-sm text-gray-600">Places disponibles</div>
        </div>
      </div>

      <!-- Tableau des offres -->
      <div class="bg-white rounded-lg border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left p-4 font-medium text-gray-900">#</th>
                <th class="text-left p-4 font-medium text-gray-900">Titre</th>
                <th class="text-left p-4 font-medium text-gray-900">Domaine</th>
                <th class="text-left p-4 font-medium text-gray-900">Lieu</th>
                <th class="text-left p-4 font-medium text-gray-900">Rémunération</th>
                <th class="text-left p-4 font-medium text-gray-900">Statut</th>
                <th class="text-right p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let o of paged" class="hover:bg-gray-50">
                <td class="p-4 text-sm text-gray-900">#{{ o.id }}</td>
                <td class="p-4">
                  <div class="font-medium text-gray-900">{{ o.titre || '-' }}</div>
                  <div class="text-sm text-gray-500" *ngIf="o.description">{{ (o.description || '').substring(0, 60) }}{{ (o.description || '').length > 60 ? '...' : '' }}</div>
                </td>
                <td class="p-4 text-sm text-gray-900">
                  <span class="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {{ o.domaine || '-' }}
                  </span>
                </td>
                <td class="p-4 text-sm text-gray-900">{{ o.lieu || '-' }}</td>
                <td class="p-4 text-sm text-gray-900">
                  <span *ngIf="o.remuneration && o.remuneration > 0">{{ formatCurrency(o.remuneration) }}</span>
                  <span *ngIf="!o.remuneration || o.remuneration === 0" class="text-gray-500">Non rémunéré</span>
                </td>
                <td class="p-4">
                  <span *ngIf="o.estActive" class="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                  <span *ngIf="!o.estActive" class="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    Inactive
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      (click)="viewOffre(o)" 
                      class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Voir
                    </button>
                    <a 
                      [routerLink]="['/offres', o.id, 'modifier']" 
                      class="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Modifier
                    </a>
                    <button 
                      (click)="confirmDelete(o)" 
                      class="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="paged.length === 0" class="p-8 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune offre</h3>
          <p class="mt-1 text-sm text-gray-500">Commencez par créer votre première offre de stage.</p>
          <div class="mt-6">
            <a routerLink="/offres/nouvelle" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nouvelle offre
            </a>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between" *ngIf="totalPages > 1">
        <div class="text-sm text-gray-700">
          Affichage de {{ (page - 1) * pageSize + 1 }} à {{ Math.min(page * pageSize, filtered.length) }} sur {{ filtered.length }} résultats
        </div>
        <div class="flex items-center gap-2">
          <button 
            (click)="goTo(page - 1)" 
            [disabled]="page === 1"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span class="px-3 py-2 text-sm text-gray-700">Page {{ page }} sur {{ totalPages }}</span>
          <button 
            (click)="goTo(page + 1)" 
            [disabled]="page === totalPages"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de détails -->
    <ng-template #offreDetailsModal let-modal>
      <div class="modal-header border-b p-4">
        <h4 class="modal-title font-semibold text-lg">Détails de l'offre</h4>
        <button type="button" class="btn-close" aria-label="Close" (click)="modal.dismiss()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body p-6" *ngIf="selectedOffre">
        <div class="space-y-6">
          <!-- En-tête -->
          <div class="border-b pb-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-xl font-bold text-gray-900">{{ selectedOffre.titre }}</h3>
                <p class="text-gray-600 mt-1">{{ selectedOffre.domaine }} • {{ selectedOffre.lieu }}</p>
              </div>
              <span [ngClass]="{
                'bg-green-100 text-green-800': selectedOffre.estActive,
                'bg-gray-100 text-gray-800': !selectedOffre.estActive
              }" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ selectedOffre.estActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <!-- Informations principales -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Durée</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedOffre.duree }} mois</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Rémunération</label>
              <p class="mt-1 text-sm text-gray-900">
                <span *ngIf="selectedOffre.remuneration && selectedOffre.remuneration > 0">{{ formatCurrency(selectedOffre.remuneration) }}</span>
                <span *ngIf="!selectedOffre.remuneration || selectedOffre.remuneration === 0" class="text-gray-500">Non rémunéré</span>
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date de début</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedOffre.dateDebut | date:'dd/MM/yyyy' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date de fin</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedOffre.dateFin | date:'dd/MM/yyyy' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre de places</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedOffre.nombrePlaces || 1 }}</p>
            </div>
            <div *ngIf="selectedOffre.contactNom">
              <label class="block text-sm font-medium text-gray-700">Contact</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedOffre.contactNom }}</p>
              <p class="text-sm text-gray-600" *ngIf="selectedOffre.contactEmail">{{ selectedOffre.contactEmail }}</p>
            </div>
          </div>

          <!-- Description -->
          <div *ngIf="selectedOffre.description">
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ selectedOffre.description }}</p>
          </div>

          <!-- Compétences -->
          <div *ngIf="selectedOffre.competences">
            <label class="block text-sm font-medium text-gray-700">Compétences requises</label>
            <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ selectedOffre.competences }}</p>
          </div>

          <!-- Avantages -->
          <div *ngIf="selectedOffre.avantages">
            <label class="block text-sm font-medium text-gray-700">Avantages</label>
            <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ selectedOffre.avantages }}</p>
          </div>
        </div>
      </div>
      <div class="modal-footer border-t p-4 flex justify-between">
        <div class="flex gap-2">
          <a [routerLink]="['/offres', selectedOffre?.id, 'modifier']" class="btn btn-primary" (click)="modal.dismiss()">
            Modifier l'offre
          </a>
        </div>
        <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">Fermer</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .modal-backdrop {
      display: none !important;
    }
    .modal {
      background: rgba(0, 0, 0, 0.5);
    }
    .btn {
      @apply px-4 py-2 rounded-md text-sm font-medium;
    }
    .btn-primary {
      @apply bg-blue-600 text-white hover:bg-blue-700;
    }
    .btn-secondary {
      @apply bg-gray-300 text-gray-700 hover:bg-gray-400;
    }
    .btn-close {
      @apply text-gray-400 hover:text-gray-600 text-2xl leading-none;
    }
  `]
})
export class EntrepriseOffresPageComponent implements OnInit {
  @ViewChild('offreDetailsModal') offreDetailsModal!: TemplateRef<any>;
  
  offres: OffreDto[] = [];
  filtered: OffreDto[] = [];
  paged: OffreDto[] = [];
  selectedOffre: OffreDto | null = null;
  q = '';
  sortKey: 'id' | 'titre' | 'domaine' = 'id';
  page = 1;
  pageSize = 10;
  totalPages = 1;
  Math = Math;

  constructor(
    private service: OffreService, 
    private auth: AuthService, 
    private toast: ToastService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.service.findAll().subscribe(list => { this.offres = list; this.applyFilters(); });
  }

  get isEntreprise() { return this.auth.role === 'ENTREPRISE' || this.auth.role === 'ADMIN'; }
  get isEtudiant() { return this.auth.role === 'ETUDIANT'; }

  applyFilters() {
    const q = this.q.toLowerCase().trim();
    this.filtered = this.offres.filter(o => !q || (String(o.id||'').includes(q) || (o.titre||'').toLowerCase().includes(q) || (o.domaine||'').toLowerCase().includes(q)));
    this.filtered.sort((a,b)=>{
      const ka:any = this.sortKey==='id' ? (a.id||0) : (a as any)[this.sortKey];
      const kb:any = this.sortKey==='id' ? (b.id||0) : (b as any)[this.sortKey];
      if (ka==null && kb==null) return 0; if (ka==null) return -1; if (kb==null) return 1; return ka<kb?-1:ka>kb?1:0;
    });
    this.page = 1;
    this.computePage();
  }

  computePage() {
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    const start = (this.page - 1) * this.pageSize;
    this.paged = this.filtered.slice(start, start + this.pageSize);
  }

  goTo(p:number){ this.page = Math.min(Math.max(1,p), this.totalPages); this.computePage(); }

  confirmDelete(o: OffreDto){
    if (!o.id) return;
    const ok = confirm(`Supprimer l'offre #${o.id} ?`);
    if (!ok) return;
    this.service.delete(o.id).subscribe({
      next: _ => {
        this.toast.show("Offre supprimée", 'success');
        this.offres = this.offres.filter(x=>x.id!==o.id);
        this.applyFilters();
      },
      error: _ => this.toast.show("Erreur lors de la suppression", 'error')
    });
  }

  viewOffre(offre: OffreDto) {
    this.selectedOffre = offre;
    this.modalService.open(this.offreDetailsModal, { 
      size: 'lg', 
      backdrop: false 
    });
  }

  getActiveOffres(): number {
    return this.offres.filter(o => o.estActive).length;
  }

  getInactiveOffres(): number {
    return this.offres.filter(o => !o.estActive).length;
  }

  getTotalPlaces(): number {
    return this.offres.reduce((total, o) => total + (o.nombrePlaces || 1), 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('XOF', 'CFA');
  }
}
