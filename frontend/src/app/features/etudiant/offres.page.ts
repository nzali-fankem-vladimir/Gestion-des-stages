import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OffreService, OffreDto } from '../../core/services/offre.service';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface EtudiantOffreView {
  id: number;
  titre: string;
  entreprise: string;
  description: string;
  datePublication: string;
  dateExpiration: string;
  statut: 'ACTIVE' | 'EXPIREE';
  candidatures: number;
  estActive: boolean;
  dejaCandidate?: boolean;
}

@Component({
  selector: 'app-etudiant-offres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
    :host ::ng-deep .offre-details-modal-no-backdrop .modal-backdrop {
      display: none !important;
    }
    
    :host ::ng-deep .offre-details-modal-no-backdrop .modal-dialog {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
      border-radius: 0.75rem;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      background: white;
    }
    `
  ],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Offres de stage disponibles</h1>
        <div class="text-sm text-gray-500">
          {{ offres.length }} offre(s) disponible(s)
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white border rounded-lg p-4">
        <div class="flex gap-4">
          <input 
            type="text" 
            placeholder="Rechercher par titre ou entreprise..." 
            class="border rounded px-3 py-2 flex-1"
            (input)="searchOffres($event)"
          />
          <select class="border rounded px-3 py-2" (change)="filterByStatus($event)">
            <option value="">Toutes les offres</option>
            <option value="ACTIVE">Actives uniquement</option>
            <option value="non-candidate">Non candidatées</option>
          </select>
        </div>
      </div>

      <!-- Liste des offres -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let offre of filteredOffres" 
             class="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          
          <!-- En-tête de la carte -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ offre.titre }}</h3>
              <p class="text-sm text-gray-600">{{ offre.entreprise }}</p>
            </div>
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                  [ngClass]="getStatusBadgeClass(offre.statut)">
              {{ getStatusLabel(offre.statut) }}
            </span>
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-700 mb-4 line-clamp-3">
            {{ offre.description | slice:0:150 }}{{ offre.description.length > 150 ? '...' : '' }}
          </p>

          <!-- Informations -->
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-xs text-gray-500">
              <span>Publié le</span>
              <span>{{ formatDate(offre.datePublication) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Expire le</span>
              <span>{{ formatDate(offre.dateExpiration) }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Candidatures</span>
              <span>{{ offre.candidatures }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button 
              class="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              (click)="viewOffre(offre)"
            >
              Voir détails
            </button>
            <button 
              *ngIf="!offre.dejaCandidate && offre.statut === 'ACTIVE'"
              class="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              (click)="candidater(offre)"
            >
              Candidater
            </button>
            <span 
              *ngIf="offre.dejaCandidate"
              class="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-500 text-center"
            >
              Déjà candidaté
            </span>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div *ngIf="!loading && filteredOffres.length === 0" 
           class="text-center py-12 bg-white border rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-gray-400 mx-auto mb-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune offre trouvée</h3>
        <p class="text-gray-500">Essayez de modifier vos critères de recherche.</p>
      </div>

      <!-- Chargement -->
      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-500">Chargement des offres...</p>
      </div>
    </div>

    <!-- Modal détails offre -->
    <ng-template #offreDetailsModal let-modal>
      <div class="modal-header bg-blue-600 text-white flex justify-between items-center px-6 py-4">
        <h4 class="text-lg font-semibold text-white">{{ selectedOffre?.titre }}</h4>
        <button type="button" 
                class="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all" 
                (click)="closeModal(modal)" 
                aria-label="Fermer">
          ×
        </button>
      </div>
      
      <div class="modal-body p-6" *ngIf="selectedOffre">
        <!-- En-tête avec entreprise et statut -->
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
              <div class="text-2xl font-bold text-blue-600">{{ selectedOffre.candidatures }}</div>
            </div>
          </div>
        </div>

        <!-- Description complète -->
        <div class="mb-6">
          <h6 class="text-sm font-medium text-gray-500 mb-2">Description du stage</h6>
          <div class="bg-white border rounded-lg p-4">
            <p class="text-gray-900 whitespace-pre-wrap">{{ selectedOffre.description }}</p>
          </div>
        </div>

        <!-- Informations détaillées -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Date de publication</label>
            <p class="text-gray-900">{{ formatDate(selectedOffre.datePublication) }}</p>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Date limite</label>
            <p class="text-gray-900">{{ formatDate(selectedOffre.dateExpiration) }}</p>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Nombre de candidatures</label>
            <p class="text-gray-900 font-semibold">{{ selectedOffre.candidatures }} candidature(s)</p>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Statut de votre candidature</label>
            <p class="text-gray-900">{{ selectedOffre.dejaCandidate ? 'Déjà candidaté' : 'Pas encore candidaté' }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div *ngIf="!selectedOffre.dejaCandidate && selectedOffre.statut === 'ACTIVE'" 
             class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h6 class="text-sm font-medium text-green-800 mb-2">Candidater à cette offre</h6>
          <p class="text-sm text-green-700 mb-3">
            Vous pouvez candidater à cette offre. Votre CV et lettre de motivation seront envoyés à l'entreprise.
          </p>
          <button class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  (click)="candidater(selectedOffre); closeModal(modal)">
            Candidater maintenant
          </button>
        </div>

        <div *ngIf="selectedOffre.dejaCandidate" 
             class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-blue-800">✅ Vous avez déjà candidaté à cette offre.</p>
        </div>

        <div *ngIf="selectedOffre.statut === 'EXPIREE'" 
             class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p class="text-gray-700">⏰ Cette offre a expiré. Vous ne pouvez plus candidater.</p>
        </div>
      </div>
      
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-end">
        <button type="button" 
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors" 
                (click)="closeModal(modal)">
          Fermer
        </button>
      </div>
    </ng-template>
  `
})
export class EtudiantOffresPageComponent implements OnInit {
  @ViewChild('offreDetailsModal') offreDetailsModal!: TemplateRef<any>;
  
  offres: EtudiantOffreView[] = [];
  filteredOffres: EtudiantOffreView[] = [];
  selectedOffre: EtudiantOffreView | null = null;
  loading = false;

  constructor(
    private offreService: OffreService,
    private toast: ToastService,
    private auth: AuthService,
    private modalService: NgbModal,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadOffres();
  }

  loadOffres() {
    this.loading = true;
    
    // Charger les offres et les candidatures de l'étudiant en parallèle
    const user = this.auth.currentUser;
    
    this.offreService.findAll().subscribe({
      next: (offres) => {
        // Filtrer seulement les offres actives
        const offresActives = offres.filter(offre => offre.estActive);
        
        if (user) {
          // Charger les candidatures de l'étudiant pour vérifier s'il a déjà candidaté
          this.http.get<any[]>(`${environment.apiUrl}/candidatures/etudiant/${user.id}`).subscribe({
            next: (candidatures) => {
              this.offres = this.mapOffresToEtudiantView(offresActives, candidatures);
              this.filteredOffres = [...this.offres];
              this.loading = false;
            },
            error: (err) => {
              console.error('Erreur candidatures:', err);
              // Continuer sans les candidatures
              this.offres = this.mapOffresToEtudiantView(offresActives, []);
              this.filteredOffres = [...this.offres];
              this.loading = false;
            }
          });
        } else {
          this.offres = this.mapOffresToEtudiantView(offresActives, []);
          this.filteredOffres = [...this.offres];
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des offres:', err);
        this.toast.show('Erreur lors du chargement des offres', 'error');
        this.loading = false;
      }
    });
  }

  private mapOffresToEtudiantView(offres: OffreDto[], candidatures: any[] = []): EtudiantOffreView[] {
    return offres.map(offre => {
      // Vérifier si l'étudiant a déjà candidaté à cette offre
      const dejaCandidate = candidatures.some(c => c.offreId === offre.id);
      
      // Compter le nombre de candidatures pour cette offre
      const nombreCandidatures = candidatures.filter(c => c.offreId === offre.id).length;
      
      return {
        id: offre.id || 0,
        titre: offre.titre || 'Titre non défini',
        entreprise: 'Entreprise', // TODO: Récupérer le nom de l'entreprise depuis offre.entrepriseId
        description: offre.description || '',
        datePublication: offre.dateDebut || new Date().toISOString(),
        dateExpiration: offre.dateLimiteCandidature || offre.dateFin || '',
        statut: this.getStatutFromOffre(offre),
        candidatures: nombreCandidatures,
        estActive: offre.estActive || false,
        dejaCandidate: dejaCandidate
      };
    });
  }

  private getStatutFromOffre(offre: OffreDto): 'ACTIVE' | 'EXPIREE' {
    if (offre.dateLimiteCandidature && new Date(offre.dateLimiteCandidature) < new Date()) {
      return 'EXPIREE';
    }
    return 'ACTIVE';
  }

  searchOffres(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredOffres = this.offres.filter(offre => 
      offre.titre.toLowerCase().includes(query) ||
      offre.entreprise.toLowerCase().includes(query) ||
      offre.description.toLowerCase().includes(query)
    );
  }

  filterByStatus(event: any) {
    const status = event.target.value;
    if (status === 'ACTIVE') {
      this.filteredOffres = this.offres.filter(offre => offre.statut === 'ACTIVE');
    } else if (status === 'non-candidate') {
      this.filteredOffres = this.offres.filter(offre => !offre.dejaCandidate);
    } else {
      this.filteredOffres = [...this.offres];
    }
  }

  viewOffre(offre: EtudiantOffreView) {
    this.selectedOffre = offre;
    
    const modalRef = this.modalService.open(this.offreDetailsModal, {
      size: 'lg',
      backdrop: false,
      keyboard: true,
      centered: true,
      scrollable: true,
      windowClass: 'offre-details-modal-no-backdrop'
    });
  }

  candidater(offre: EtudiantOffreView) {
    if (offre.dejaCandidate) {
      this.toast.show('Vous avez déjà candidaté à cette offre', 'warning');
      return;
    }

    if (offre.statut === 'EXPIREE') {
      this.toast.show('Cette offre a expiré', 'error');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      this.toast.show('Vous devez être connecté pour candidater', 'error');
      return;
    }

    // Créer une candidature réelle
    const candidatureData = {
      etudiantId: user.id,
      offreId: offre.id,
      statut: 'EN_ATTENTE',
      lettreMotivation: 'Candidature envoyée depuis la plateforme', // Pourra être amélioré avec un formulaire
      luParEntreprise: false
    };

    console.log('=== CREATING CANDIDATURE ===');
    console.log('Candidature Data:', candidatureData);

    this.http.post(`${environment.apiUrl}/candidatures`, candidatureData).subscribe({
      next: (response: any) => {
        console.log('Candidature créée:', response);
        offre.dejaCandidate = true;
        offre.candidatures++;
        this.toast.show(`Candidature envoyée pour "${offre.titre}"`, 'success');
      },
      error: (err) => {
        console.error('Erreur candidature:', err);
        if (err.status === 409) {
          this.toast.show('Vous avez déjà candidaté à cette offre', 'warning');
          offre.dejaCandidate = true;
        } else {
          this.toast.show('Erreur lors de l\'envoi de la candidature', 'error');
        }
      }
    });
  }

  closeModal(modal: any) {
    try {
      modal.dismiss('close');
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
      modal.close();
    }
    this.selectedOffre = null;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Active',
      'EXPIREE': 'Expirée'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'EXPIREE': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
