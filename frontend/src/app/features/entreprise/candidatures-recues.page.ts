import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { CandidatureService, CandidatureDto } from '../../core/services/candidature.service';
import { environment } from '../../../environments/environment';

interface CandidatureEtendue extends CandidatureDto {
  etudiant?: { id: number; nom: string; prenom: string; email: string; telephone?: string; };
  offre?: { id: number; titre: string; domaine?: string; lieu?: string; remuneration?: number; dateDebut?: string; dateFin?: string; duree?: number; description?: string; };
  etudiantNom?: string;
  etudiantPrenom?: string;
  etudiantEmail?: string;
  etudiantTelephone?: string;
  offreTitre?: string;
  offreDomaine?: string;
  offreLieu?: string;
  offreDescription?: string;
}

@Component({
  selector: 'app-candidatures-recues-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    /* Styles pour les modales sans backdrop */
    :host ::ng-deep .modal {
      background: rgba(0, 0, 0, 0.5) !important;
    }
    
    :host ::ng-deep .modal-dialog {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
      border: 1px solid #e5e7eb !important;
    }
    
    :host ::ng-deep .modal-content {
      border-radius: 8px !important;
      overflow: hidden !important;
    }

    /* Focus des champs de saisie */
    :host ::ng-deep textarea:focus,
    :host ::ng-deep input:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
  `],
  template: `
    <div class="max-w-7xl mx-auto p-6 space-y-6">
      <!-- En-tête -->
      <div class="bg-white rounded-lg border p-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Candidatures reçues</h1>
            <p class="text-gray-600">Gérez les candidatures des étudiants pour vos offres de stage</p>
          </div>
          <div class="text-sm text-gray-500">
            Total : {{ candidatures.length }} candidature(s)
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-lg border p-4">
        <div class="flex flex-wrap gap-4 items-center">
          <div>
            <input 
              [(ngModel)]="searchQuery" 
              (input)="applyFilters()"
              class="border rounded px-3 py-2 text-sm" 
              placeholder="Rechercher par nom, offre..."
            />
          </div>
          <div>
            <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="border rounded px-3 py-2 text-sm">
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="ACCEPTEE">Acceptée</option>
              <option value="REFUSEE">Refusée</option>
              <option value="EN_COURS">En cours d'examen</option>
            </select>
          </div>
          <div>
            <select [(ngModel)]="offreFilter" (change)="applyFilters()" class="border rounded px-3 py-2 text-sm">
              <option value="">Toutes les offres</option>
              <option *ngFor="let offre of offres" [value]="offre.id">{{ offre.titre }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.enAttente }}</div>
          <div class="text-sm text-gray-600">En attente</div>
        </div>
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.acceptees }}</div>
          <div class="text-sm text-gray-600">Acceptées</div>
        </div>
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ stats.refusees }}</div>
          <div class="text-sm text-gray-600">Refusées</div>
        </div>
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ stats.enCours }}</div>
          <div class="text-sm text-gray-600">En cours</div>
        </div>
      </div>

      <!-- Tableau des candidatures -->
      <div class="bg-white rounded-lg border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-4">Étudiant</th>
              <th class="text-left p-4">Offre</th>
              <th class="text-left p-4">Date candidature</th>
              <th class="text-left p-4">Statut</th>
              <th class="text-left p-4">Lu</th>
              <th class="text-center p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let candidature of filteredCandidatures" class="border-b hover:bg-gray-50">
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-blue-600">
                      {{ getInitials(candidature.etudiantNom || candidature.etudiant?.nom, candidature.etudiantPrenom || candidature.etudiant?.prenom) }}
                    </span>
                  </div>
                  <div>
                    <div class="font-medium">{{ candidature.etudiantNom || candidature.etudiant?.nom }} {{ candidature.etudiantPrenom || candidature.etudiant?.prenom }}</div>
                    <div class="text-gray-500 text-xs">{{ candidature.etudiantEmail || candidature.etudiant?.email }}</div>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="font-medium">{{ candidature.offreTitre || candidature.offre?.titre }}</div>
                <div class="text-gray-500 text-xs">{{ candidature.offreDomaine || candidature.offre?.domaine }}</div>
              </td>
              <td class="p-4">{{ formatDate(candidature.dateCandidature) }}</td>
              <td class="p-4">
                <span class="px-2 py-1 text-xs rounded-full" [ngClass]="getStatusClass(candidature.statut)">
                  {{ getStatusLabel(candidature.statut) }}
                </span>
              </td>
              <td class="p-4">
                <span class="px-2 py-1 text-xs rounded-full" [ngClass]="candidature.luParEntreprise ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ candidature.luParEntreprise ? 'Lu' : 'Non lu' }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex justify-center space-x-2">
                  <button 
                    class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    (click)="viewCandidature(candidature)"
                  >
                    Voir
                  </button>
                  <button 
                    *ngIf="candidature.statut === 'EN_ATTENTE'"
                    class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                    (click)="acceptCandidature(candidature)"
                  >
                    Accepter
                  </button>
                  <button 
                    *ngIf="candidature.statut === 'EN_ATTENTE'"
                    class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
                    (click)="refuseCandidature(candidature)"
                  >
                    Refuser
                  </button>
                  <button 
                    class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                    (click)="sendMessage(candidature)"
                  >
                    Message
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div *ngIf="filteredCandidatures.length === 0" class="text-center py-8 text-gray-500">
          Aucune candidature trouvée
        </div>
      </div>
    </div>

    <!-- Modal de détail candidature -->
    <ng-template #candidatureModal let-modal>
      <div class="modal-header bg-blue-600 text-white p-4 flex justify-between items-center">
        <h4 class="text-lg font-semibold">Détails de la candidature</h4>
        <button type="button" class="text-white text-xl" (click)="closeModal(modal)">×</button>
      </div>
      <div class="modal-body p-6" *ngIf="selectedCandidature">
        <div class="space-y-6">
          <!-- Informations étudiant -->
          <div>
            <h5 class="font-semibold mb-3">Informations de l'étudiant</h5>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Nom :</span>
                <span class="ml-2 font-medium">{{ selectedCandidature.etudiantNom || selectedCandidature.etudiant?.nom }} {{ selectedCandidature.etudiantPrenom || selectedCandidature.etudiant?.prenom }}</span>
              </div>
              <div>
                <span class="text-gray-600">Email :</span>
                <span class="ml-2">{{ selectedCandidature.etudiantEmail || selectedCandidature.etudiant?.email }}</span>
              </div>
              <div>
                <span class="text-gray-600">Téléphone :</span>
                <span class="ml-2">{{ selectedCandidature.etudiantTelephone || selectedCandidature.etudiant?.telephone || 'Non renseigné' }}</span>
              </div>
              <div>
                <span class="text-gray-600">Date de candidature :</span>
                <span class="ml-2">{{ formatDate(selectedCandidature.dateCandidature) }}</span>
              </div>
            </div>
          </div>

          <!-- Offre concernée -->
          <div>
            <h5 class="font-semibold mb-3">Offre concernée</h5>
            <div class="bg-gray-50 p-4 rounded">
              <div class="font-medium">{{ selectedCandidature.offreTitre || selectedCandidature.offre?.titre }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ selectedCandidature.offreDomaine || selectedCandidature.offre?.domaine }} • {{ selectedCandidature.offreLieu || selectedCandidature.offre?.lieu }}</div>
            </div>
          </div>

          <!-- Lettre de motivation -->
          <div *ngIf="selectedCandidature.lettreMotivation">
            <h5 class="font-semibold mb-3">Lettre de motivation</h5>
            <div class="bg-gray-50 p-4 rounded">
              <p class="text-sm whitespace-pre-wrap">{{ selectedCandidature.lettreMotivation }}</p>
            </div>
          </div>

          <!-- CV -->
          <div *ngIf="selectedCandidature.cvUrl">
            <h5 class="font-semibold mb-3">CV</h5>
            <div class="flex items-center space-x-3">
              <button 
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                (click)="downloadCV(selectedCandidature)"
              >
                📄 Télécharger le CV
              </button>
              <button 
                class="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                (click)="previewCV(selectedCandidature)"
              >
                👁️ Aperçu
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t pt-4">
            <h5 class="font-semibold mb-3">Actions</h5>
            <div class="flex space-x-3">
              <button 
                *ngIf="selectedCandidature.statut === 'EN_ATTENTE'"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                (click)="acceptCandidatureFromModal(selectedCandidature, modal)"
              >
                ✅ Accepter
              </button>
              <button 
                *ngIf="selectedCandidature.statut === 'EN_ATTENTE'"
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                (click)="refuseCandidatureFromModal(selectedCandidature, modal)"
              >
                ❌ Refuser
              </button>
              <button 
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                (click)="sendMessageFromModal(selectedCandidature, modal)"
              >
                💬 Envoyer un message
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 p-4 flex justify-end">
        <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" (click)="closeModal(modal)">
          Fermer
        </button>
      </div>
    </ng-template>

    <!-- Modal de confirmation -->
    <ng-template #confirmModal let-modal>
      <div class="modal-header bg-blue-600 text-white p-4 flex justify-between items-center">
        <h4 class="text-lg font-semibold">Confirmation</h4>
        <button type="button" class="text-white text-xl" (click)="closeModal(modal)">×</button>
      </div>
      <div class="modal-body p-6">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ confirmAction | titlecase }} la candidature</h3>
            <p class="text-gray-600 mt-2 whitespace-pre-line">{{ confirmMessage }}</p>
          </div>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 p-4 flex justify-end space-x-3">
        <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" (click)="closeModal(modal)">
          Annuler
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" (click)="executeConfirmAction(); closeModal(modal)">
          Confirmer
        </button>
      </div>
    </ng-template>

    <!-- Modal de message -->
    <ng-template #messageModal let-modal>
      <div class="modal-header bg-blue-600 text-white p-4 flex justify-between items-center">
        <h4 class="text-lg font-semibold">Envoyer un message</h4>
        <button type="button" class="text-white text-xl" (click)="closeModal(modal)">×</button>
      </div>
      <div class="modal-body p-6" *ngIf="selectedCandidature">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Destinataire :</label>
            <div class="bg-gray-50 p-3 rounded">
              {{ selectedCandidature.etudiantPrenom || selectedCandidature.etudiant?.prenom }} {{ selectedCandidature.etudiantNom || selectedCandidature.etudiant?.nom }} ({{ selectedCandidature.etudiantEmail || selectedCandidature.etudiant?.email }})
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Message :</label>
            <textarea 
              [(ngModel)]="messageContent"
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="5"
              placeholder="Tapez votre message ici..."
            ></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 p-4 flex justify-end space-x-3">
        <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" (click)="closeModal(modal)">
          Annuler
        </button>
        <button 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          [disabled]="!messageContent.trim()"
          (click)="sendMessageToStudentAndClose(modal)"
        >
          Envoyer
        </button>
      </div>
    </ng-template>
  `
})
export class CandidaturesRecuesPageComponent implements OnInit {
  @ViewChild('candidatureModal') candidatureModal!: TemplateRef<any>;
  @ViewChild('confirmModal') confirmModal!: TemplateRef<any>;
  @ViewChild('messageModal') messageModal!: TemplateRef<any>;

  candidatures: CandidatureEtendue[] = [];
  filteredCandidatures: CandidatureEtendue[] = [];
  offres: any[] = [];
  selectedCandidature: CandidatureEtendue | null = null;
  
  // Pour les modales de confirmation
  confirmAction: string = '';
  confirmMessage: string = '';
  confirmCallback: (() => void) | null = null;
  
  // Pour la modal de message
  messageContent: string = '';
  
  searchQuery = '';
  statusFilter = '';
  offreFilter = '';
  
  stats = {
    enAttente: 0,
    acceptees: 0,
    refusees: 0,
    enCours: 0
  };

  constructor(
    private candidatureService: CandidatureService,
    private auth: AuthService,
    private toast: ToastService,
    private modalService: NgbModal,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCandidatures();
    this.loadOffres();
  }

  loadCandidatures() {
    const user = this.auth.currentUser;
    if (!user) return;

    console.log('=== LOADING CANDIDATURES FOR ENTREPRISE ===');
    console.log('User ID:', user.id);

    // Utiliser le service CandidatureService
    this.candidatureService.getByEntreprise(user.id).subscribe({
      next: (candidatures) => {
        console.log('Candidatures loaded:', candidatures);
        this.candidatures = candidatures as CandidatureEtendue[];
        this.applyFilters();
        this.calculateStats();
        
        // Marquer comme lues
        this.markAsRead();
      },
      error: (err) => {
        console.error('Erreur chargement candidatures:', err);
        this.toast.show('Erreur lors du chargement des candidatures', 'error');
      }
    });
  }

  loadOffres() {
    const user = this.auth.currentUser;
    if (!user) return;

    this.http.get<any[]>(`${environment.apiUrl}/offres/entreprise/${user.id}`).subscribe({
      next: (offres) => {
        this.offres = offres;
      },
      error: (err) => {
        console.error('Erreur chargement offres:', err);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.candidatures];
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.etudiant?.nom?.toLowerCase().includes(query) ||
        c.etudiant?.prenom?.toLowerCase().includes(query) ||
        c.offre?.titre?.toLowerCase().includes(query)
      );
    }
    
    if (this.statusFilter) {
      filtered = filtered.filter(c => c.statut === this.statusFilter);
    }
    
    if (this.offreFilter) {
      filtered = filtered.filter(c => c.offre?.id?.toString() === this.offreFilter);
    }
    
    this.filteredCandidatures = filtered;
  }

  calculateStats() {
    this.stats = {
      enAttente: this.candidatures.filter(c => c.statut === 'EN_ATTENTE').length,
      acceptees: this.candidatures.filter(c => c.statut === 'ACCEPTEE').length,
      refusees: this.candidatures.filter(c => c.statut === 'REFUSEE').length,
      enCours: this.candidatures.filter(c => c.statut === 'EN_COURS').length
    };
  }

  markAsRead() {
    // Marquer toutes les candidatures non lues comme lues
    const unreadCandidatures = this.candidatures.filter(c => !c.luParEntreprise);
    
    unreadCandidatures.forEach(candidature => {
      if (candidature.id) {
        this.candidatureService.updateFields(candidature.id, { luParEntreprise: true }).subscribe({
          next: () => {
            candidature.luParEntreprise = true;
          },
          error: (err) => {
            console.error('Erreur marquage lu:', err);
          }
        });
      }
    });
  }

  viewCandidature(candidature: CandidatureEtendue) {
    this.selectedCandidature = candidature;
    this.modalService.open(this.candidatureModal, { size: 'lg', backdrop: false });
  }

  acceptCandidature(candidature: CandidatureEtendue) {
    this.showConfirmModal(
      'accepter', 
      `Êtes-vous sûr de vouloir accepter la candidature de ${candidature.etudiant?.prenom} ${candidature.etudiant?.nom} ?\n\nCela créera automatiquement une convention de stage.`,
      () => this.doAcceptCandidature(candidature)
    );
  }

  doAcceptCandidature(candidature: CandidatureEtendue) {
    if (!candidature.id) return;

    this.candidatureService.updateFields(candidature.id, { statut: 'ACCEPTEE' }).subscribe({
      next: () => {
        candidature.statut = 'ACCEPTEE';
        this.toast.show('Candidature acceptée', 'success');
        this.calculateStats();
        this.applyFilters();
        
        // Créer automatiquement une convention de stage
        this.createConventionForCandidature(candidature);
        
        // Proposer d'envoyer un message automatique
        setTimeout(() => {
          const autoMessage = `Bonjour ${candidature.etudiantPrenom || candidature.etudiant?.prenom},\n\nNous avons le plaisir de vous informer que votre candidature pour l'offre "${candidature.offreTitre || candidature.offre?.titre}" a été acceptée.\n\nUne convention de stage a été automatiquement créée et sera soumise à votre enseignant pour validation.\n\nNous vous contacterons prochainement pour finaliser les détails.\n\nCordialement,\nL'équipe RH`;
          
          if (confirm('Souhaitez-vous envoyer un message automatique à l\'étudiant pour l\'informer de l\'acceptation ?')) {
            this.showMessageModal(candidature, autoMessage);
          }
        }, 1000);
      },
      error: (err) => {
        console.error('Erreur acceptation:', err);
        this.toast.show('Erreur lors de l\'acceptation', 'error');
      }
    });
  }

  createConventionForCandidature(candidature: CandidatureEtendue) {
    if (!candidature.etudiant?.id || !candidature.offre?.id) {
      this.toast.show('Données manquantes pour créer la convention', 'error');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) return;

    // Calculer les dates par défaut
    const dateDebut = candidature.offre.dateDebut || new Date().toISOString().split('T')[0];
    const dateFin = candidature.offre.dateFin || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const conventionData = {
      etudiantId: candidature.etudiant.id,
      entrepriseId: user.id,
      offreId: candidature.offre.id,
      candidatureId: candidature.id,
      dateDebut: dateDebut,
      dateFin: dateFin,
      duree: candidature.offre.duree || 3,
      gratification: candidature.offre.remuneration || 0,
      objectifs: `Stage en ${candidature.offre.domaine} - ${candidature.offre.titre}`,
      missions: candidature.offre.description || 'Missions à définir',
      statut: 'BROUILLON'
    };

    console.log('=== CREATING CONVENTION ===');
    console.log('Convention Data:', conventionData);

    this.http.post(`${environment.apiUrl}/conventions`, conventionData).subscribe({
      next: (convention: any) => {
        console.log('Convention créée:', convention);
        this.toast.show(
          `Convention de stage créée automatiquement (ID: ${convention.id}). ` +
          `Vous pouvez la modifier dans la section "Conventions de stage".`,
          'success'
        );
      },
      error: (err) => {
        console.error('Erreur création convention:', err);
        this.toast.show('Candidature acceptée mais erreur lors de la création de la convention', 'warning');
      }
    });
  }

  refuseCandidature(candidature: CandidatureEtendue) {
    this.showConfirmModal(
      'refuser',
      `Êtes-vous sûr de vouloir refuser la candidature de ${candidature.etudiant?.prenom} ${candidature.etudiant?.nom} ?`,
      () => this.doRefuseCandidature(candidature)
    );
  }

  doRefuseCandidature(candidature: CandidatureEtendue) {
    if (!candidature.id) return;

    this.candidatureService.updateFields(candidature.id, { statut: 'REFUSEE' }).subscribe({
      next: () => {
        candidature.statut = 'REFUSEE';
        this.toast.show('Candidature refusée', 'success');
        this.calculateStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur refus:', err);
        this.toast.show('Erreur lors du refus', 'error');
      }
    });
  }

  sendMessage(candidature: CandidatureEtendue) {
    this.showMessageModal(candidature);
  }

  // Méthodes pour gérer les modales
  showConfirmModal(action: string, message: string, callback: () => void) {
    this.confirmAction = action;
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.modalService.open(this.confirmModal, { backdrop: false });
  }

  executeConfirmAction() {
    if (this.confirmCallback) {
      this.confirmCallback();
      this.confirmCallback = null;
    }
  }

  showMessageModal(candidature: CandidatureEtendue, autoMessage?: string) {
    this.selectedCandidature = candidature;
    this.messageContent = autoMessage || '';
    this.modalService.open(this.messageModal, { backdrop: false });
  }

  sendMessageToStudent() {
    if (!this.selectedCandidature || !this.messageContent.trim()) return;

    // TODO: Implémenter l'envoi de message via l'API
    this.toast.show(`Message envoyé à ${this.selectedCandidature.etudiant?.prenom} ${this.selectedCandidature.etudiant?.nom}`, 'success');
    this.messageContent = '';
  }

  // Méthodes pour gérer les actions depuis les modales
  acceptCandidatureFromModal(candidature: CandidatureEtendue, modal: any) {
    this.showConfirmModal(
      'accepter', 
      `Êtes-vous sûr de vouloir accepter la candidature de ${candidature.etudiant?.prenom} ${candidature.etudiant?.nom} ?\n\nCela créera automatiquement une convention de stage.`,
      () => this.doAcceptCandidature(candidature)
    );
    this.closeModal(modal);
  }

  refuseCandidatureFromModal(candidature: CandidatureEtendue, modal: any) {
    this.showConfirmModal(
      'refuser',
      `Êtes-vous sûr de vouloir refuser la candidature de ${candidature.etudiant?.prenom} ${candidature.etudiant?.nom} ?`,
      () => this.doRefuseCandidature(candidature)
    );
    this.closeModal(modal);
  }

  sendMessageFromModal(candidature: CandidatureEtendue, modal: any) {
    this.showMessageModal(candidature);
    this.closeModal(modal);
  }

  sendMessageToStudentAndClose(modal: any) {
    this.sendMessageToStudent();
    this.closeModal(modal);
  }

  downloadCV(candidature: CandidatureEtendue) {
    if (candidature.cvUrl) {
      const fileName = candidature.cvUrl.includes('/') ? candidature.cvUrl.split('/').pop() : candidature.cvUrl;
      const fileUrl = candidature.cvUrl.startsWith('http') ? candidature.cvUrl : `${environment.apiUrl}/uploads/${fileName}`;
      
      // Force download
      fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `CV_${candidature.etudiantNom || candidature.etudiant?.nom}_${candidature.etudiantPrenom || candidature.etudiant?.prenom}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(err => {
          console.error('Erreur téléchargement CV:', err);
          this.toast.show('Erreur lors du téléchargement du CV', 'error');
        });
    }
  }

  previewCV(candidature: CandidatureEtendue) {
    if (candidature.cvUrl) {
      const fileName = candidature.cvUrl.includes('/') ? candidature.cvUrl.split('/').pop() : candidature.cvUrl;
      const fileUrl = candidature.cvUrl.startsWith('http') ? candidature.cvUrl : `${environment.apiUrl}/uploads/${fileName}`;
      window.open(fileUrl, '_blank');
    }
  }

  getInitials(nom?: string, prenom?: string): string {
    const n = nom?.charAt(0)?.toUpperCase() || '';
    const p = prenom?.charAt(0)?.toUpperCase() || '';
    return n + p || '?';
  }

  getStatusClass(statut?: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTEE': return 'bg-green-100 text-green-800';
      case 'REFUSEE': return 'bg-red-100 text-red-800';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(statut?: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'ACCEPTEE': return 'Acceptée';
      case 'REFUSEE': return 'Refusée';
      case 'EN_COURS': return 'En cours';
      default: return 'Inconnu';
    }
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  closeModal(modal: any) {
    modal.dismiss();
  }
}
