import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { NotificationService } from '../../core/services/notification.service';

interface Rapport {
  id: number;
  titre: string;
  statut: string;
  dateCreation?: string;
  dateModification?: string;
  contenu?: string;
  fichierPdf?: string;
  etudiant?: {
    nom: string;
    prenom: string;
    email: string;
  };
  convention?: {
    entreprise?: {
      nom: string;
    };
  };
  commentaires?: string;
}

@Component({
  selector: 'app-enseignant-rapports-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Rapports de stage à valider</h1>
          <p class="text-gray-600">Validez, rejetez ou demandez des modifications aux rapports de stage</p>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-yellow-600">{{ getRapportsByStatus('SOUMIS').length }}</div>
          <div class="text-sm text-yellow-600">En attente</div>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-600">{{ getRapportsByStatus('VALIDE').length }}</div>
          <div class="text-sm text-green-600">Validés</div>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-red-600">{{ getRapportsByStatus('REJETE').length }}</div>
          <div class="text-sm text-red-600">Rejetés</div>
        </div>
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-orange-600">{{ getRapportsByStatus('A_MODIFIER').length }}</div>
          <div class="text-sm text-orange-600">À modifier</div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white border rounded-lg p-4">
        <div class="flex flex-wrap gap-4">
          <select 
            [(ngModel)]="selectedStatus" 
            (ngModelChange)="filterRapports()"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les statuts</option>
            <option value="SOUMIS">En attente</option>
            <option value="VALIDE">Validés</option>
            <option value="REJETE">Rejetés</option>
            <option value="A_MODIFIER">À modifier</option>
          </select>
          
          <input 
            type="text" 
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterRapports()"
            placeholder="Rechercher par étudiant ou entreprise..."
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-64"
          />
        </div>
      </div>

      <!-- Tableau des rapports -->
      <div class="bg-white border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left p-4 font-medium text-gray-900">Étudiant</th>
                <th class="text-left p-4 font-medium text-gray-900">Entreprise</th>
                <th class="text-left p-4 font-medium text-gray-900">Titre du rapport</th>
                <th class="text-left p-4 font-medium text-gray-900">Statut</th>
                <th class="text-left p-4 font-medium text-gray-900">Date soumission</th>
                <th class="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rapport of filteredRapports" class="border-t hover:bg-gray-50">
                <td class="p-4">
                  <div class="font-medium text-gray-900">
                    {{ rapport.etudiant?.prenom }} {{ rapport.etudiant?.nom }}
                  </div>
                  <div class="text-gray-500 text-xs">
                    {{ rapport.etudiant?.email }}
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-gray-900">
                    {{ rapport.convention?.entreprise?.nom || 'N/A' }}
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-gray-900 font-medium">
                    {{ rapport.titre }}
                  </div>
                </td>
                <td class="p-4">
                  <span [class]="getStatusClass(rapport.statut)">
                    {{ getStatusLabel(rapport.statut) }}
                  </span>
                </td>
                <td class="p-4 text-gray-500">
                  {{ formatDate(rapport.dateCreation) }}
                </td>
                <td class="p-4">
                  <div class="flex space-x-2">
                    <button 
                      (click)="viewRapport(rapport)"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Voir
                    </button>
                    <button 
                      *ngIf="rapport.fichierPdf"
                      (click)="downloadRapport(rapport)"
                      class="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      PDF
                    </button>
                    <button 
                      *ngIf="rapport.statut === 'SOUMIS'"
                      (click)="validateRapport(rapport)"
                      class="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Valider
                    </button>
                    <button 
                      *ngIf="rapport.statut === 'SOUMIS'"
                      (click)="requestModification(rapport)"
                      class="text-orange-600 hover:text-orange-800 text-sm font-medium"
                    >
                      À modifier
                    </button>
                    <button 
                      *ngIf="rapport.statut === 'SOUMIS'"
                      (click)="rejectRapport(rapport)"
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Rejeter
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="filteredRapports.length === 0" class="p-8 text-center text-gray-500">
          <div class="text-lg font-medium mb-2">Aucun rapport trouvé</div>
          <p>Les rapports soumis par les étudiants apparaîtront ici.</p>
        </div>
      </div>
    </div>

    <!-- Modal de détails (utilise les classes globales .modal-*) -->
    <div *ngIf="selectedRapport" class="modal-container" (click)="closeModal()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header bg-white">
            <h3 class="text-lg font-medium text-gray-900">{{ selectedRapport.titre }}</h3>
            <button type="button" aria-label="Fermer" (click)="closeModal()" 
              class="px-3 py-1 bg-white text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">×</button>
          </div>

          <div class="modal-body">
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Étudiant</label>
                  <p class="text-gray-900">{{ selectedRapport.etudiant?.prenom }} {{ selectedRapport.etudiant?.nom }}</p>
                  <p class="text-gray-500 text-sm">{{ selectedRapport.etudiant?.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Entreprise</label>
                  <p class="text-gray-900">{{ selectedRapport.convention?.entreprise?.nom }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Date de création</label>
                  <p class="text-gray-900">{{ formatDate(selectedRapport.dateCreation) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Statut</label>
                  <span [class]="getStatusClass(selectedRapport.statut)">
                    {{ getStatusLabel(selectedRapport.statut) }}
                  </span>
                </div>
              </div>

              <div *ngIf="selectedRapport.contenu">
                <label class="block text-sm font-medium text-gray-700 mb-2">Contenu du rapport</label>
                <div class="bg-gray-50 border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p class="text-gray-900 whitespace-pre-wrap">{{ selectedRapport.contenu }}</p>
                </div>
              </div>

              <div *ngIf="selectedRapport.commentaires">
                <label class="block text-sm font-medium text-gray-700 mb-2">Commentaires de l'enseignant</label>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p class="text-gray-900 whitespace-pre-wrap">{{ selectedRapport.commentaires }}</p>
                </div>
              </div>

              <div *ngIf="selectedRapport.fichierPdf" class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <button 
                  (click)="downloadRapport(selectedRapport)"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Télécharger le rapport PDF
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer" *ngIf="selectedRapport.statut === 'SOUMIS'">
            <div class="flex justify-end space-x-3 w-full">
              <button 
                (click)="rejectRapport(selectedRapport)"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Rejeter
              </button>
              <button 
                (click)="requestModification(selectedRapport)"
                class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Demander modification
              </button>
              <button 
                (click)="validateRapport(selectedRapport)"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'action Tailwind -->
    <div *ngIf="actionRapport" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeActionModal()">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" (click)="$event.stopPropagation()">
        <div class="p-4 border-b" [ngClass]="getActionHeaderClass()">
          <div class="flex justify-between items-center">
            <h4 class="text-lg font-semibold text-white">{{ getActionTitle() }}</h4>
            <button type="button" class="text-white text-xl hover:text-gray-200" (click)="closeActionModal()">×</button>
          </div>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-700">
                    {{ actionType === 'validate' ? 'Votre commentaire sera visible par l\'étudiant.' :
                       actionType === 'modify' ? 'Décrivez clairement les modifications demandées.' :
                       'Veuillez indiquer la raison du rejet.' }}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ actionType === 'validate' ? 'Commentaires (optionnel)' : 'Commentaires' }}
                <span class="text-red-500" *ngIf="actionType !== 'validate'">*</span>
              </label>
              <textarea 
                [(ngModel)]="actionComments"
                [required]="actionType !== 'validate'"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                [placeholder]="getActionPlaceholder()"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <button 
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            (click)="closeActionModal()"
          >
            Annuler
          </button>
          <button 
            (click)="confirmAction()"
            [disabled]="actionType !== 'validate' && !actionComments.trim()"
            [class]="'px-4 py-2 text-white rounded-md transition-colors ' + getActionButtonClass() + (actionType !== 'validate' && !actionComments.trim() ? ' opacity-50 cursor-not-allowed' : '')"
          >
            {{ getActionButtonText() }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class EnseignantRapportsPageComponent implements OnInit {
  @ViewChild('actionModal') actionModal!: TemplateRef<any>;
  
  rapports: Rapport[] = [];
  filteredRapports: Rapport[] = [];
  selectedRapport: Rapport | null = null;
  selectedStatus = '';
  searchTerm = '';
  loading = false;
  
  // Propriétés pour les modales d'action
  actionRapport: Rapport | null = null;
  actionType = '';
  actionComments = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private toast: ToastService,
    private notificationService: NotificationService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.loadRapports();
  }

  loadRapports() {
    this.loading = true;
    this.http.get<Rapport[]>(`${environment.apiUrl}/rapports-hebdomadaires/enseignant/all`).subscribe({
      next: (rapports) => {
        console.log('Rapports chargés:', rapports);
        this.rapports = rapports;
        this.filteredRapports = rapports;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement rapports:', err);
        this.loading = false;
      }
    });
  }

  filterRapports() {
    this.filteredRapports = this.rapports.filter(rapport => {
      const matchesStatus = !this.selectedStatus || rapport.statut === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        rapport.etudiant?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        rapport.etudiant?.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        rapport.convention?.entreprise?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        rapport.titre?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  getRapportsByStatus(status: string): Rapport[] {
    return this.rapports.filter(r => r.statut === status);
  }

  getStatusClass(statut: string): string {
    const classes = {
      'BROUILLON': 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800',
      'SOUMIS': 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800',
      'VALIDE': 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
      'REJETE': 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
      'A_MODIFIER': 'px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800'
    };
    return classes[statut as keyof typeof classes] || classes['BROUILLON'];
  }

  getStatusLabel(statut: string): string {
    const labels = {
      'BROUILLON': 'Brouillon',
      'SOUMIS': 'En attente',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté',
      'A_MODIFIER': 'À modifier'
    };
    return labels[statut as keyof typeof labels] || statut;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  viewRapport(rapport: Rapport) {
    this.selectedRapport = rapport;
  }

  closeModal() {
    this.selectedRapport = null;
  }

  validateRapport(rapport: Rapport) {
    this.actionRapport = rapport;
    this.actionType = 'validate';
    this.actionComments = '';
  }

  requestModification(rapport: Rapport) {
    this.actionRapport = rapport;
    this.actionType = 'modify';
    this.actionComments = '';
  }

  rejectRapport(rapport: Rapport) {
    this.actionRapport = rapport;
    this.actionType = 'reject';
    this.actionComments = '';
  }

  confirmAction() {
    if (!this.actionRapport) return;

    let endpoint = '';
    let data: any = {};

    switch (this.actionType) {
      case 'validate':
        endpoint = `${environment.apiUrl}/rapports-hebdomadaires/${this.actionRapport.id}/validate`;
        data = { commentaires: this.actionComments };
        break;
      case 'modify':
        endpoint = `${environment.apiUrl}/rapports-hebdomadaires/${this.actionRapport.id}/request-modification`;
        data = { commentaires: this.actionComments };
        break;
      case 'reject':
        endpoint = `${environment.apiUrl}/rapports-hebdomadaires/${this.actionRapport.id}/reject`;
        data = { reason: this.actionComments };
        break;
    }

    this.http.put(endpoint, data).subscribe({
      next: () => {
        const messages = {
          validate: 'Rapport validé avec succès',
          modify: 'Demande de modification envoyée',
          reject: 'Rapport rejeté'
        };
        this.toast.show(messages[this.actionType as keyof typeof messages], 'success');
        this.loadRapports();
        
        // Envoyer notification automatique
        const statuts = { validate: 'VALIDE', modify: 'A_MODIFIER', reject: 'REJETE' };
        if (this.actionRapport) {
          this.sendNotification(this.actionRapport, statuts[this.actionType as keyof typeof statuts], this.actionComments);
        }
        this.closeActionModal();
      },
      error: (err) => {
        console.error('Erreur action rapport:', err);
        this.toast.show('Erreur lors de l\'action', 'error');
      }
    });
  }

  closeActionModal() {
    this.actionRapport = null;
    this.actionType = '';
    this.actionComments = '';
  }

  getActionTitle(): string {
    const titles = {
      validate: 'Valider le rapport',
      modify: 'Demander des modifications',
      reject: 'Rejeter le rapport'
    };
    return titles[this.actionType as keyof typeof titles] || '';
  }

  getActionPlaceholder(): string {
    const placeholders = {
      validate: 'Commentaires de validation (optionnel)...',
      modify: 'Décrivez les modifications à apporter...',
      reject: 'Motif du rejet...'
    };
    return placeholders[this.actionType as keyof typeof placeholders] || '';
  }

  getActionButtonText(): string {
    const texts = {
      validate: 'Valider',
      modify: 'Demander modifications',
      reject: 'Rejeter'
    };
    return texts[this.actionType as keyof typeof texts] || '';
  }

  getActionButtonClass(): string {
    const classes = {
      validate: 'bg-green-600 hover:bg-green-700',
      modify: 'bg-yellow-600 hover:bg-yellow-700',
      reject: 'bg-red-600 hover:bg-red-700'
    };
    return classes[this.actionType as keyof typeof classes] || '';
  }

  getActionHeaderClass(): string {
    const classes = {
      validate: 'bg-green-600',
      modify: 'bg-yellow-600',
      reject: 'bg-red-600'
    };
    return classes[this.actionType as keyof typeof classes] || 'bg-blue-600';
  }

  downloadRapport(rapport: Rapport) {
    if (rapport.fichierPdf) {
      window.open(`${environment.apiUrl}/files/${rapport.fichierPdf}`, '_blank');
    } else {
      this.toast.show('Aucun fichier PDF disponible', 'warning');
    }
  }

  private sendNotification(rapport: Rapport, action: string, commentaires?: string) {
    if (rapport.etudiant?.email) {
      this.notificationService.notifyRapportValidation(
        rapport.etudiant.email,
        rapport.titre,
        action as 'VALIDE' | 'REJETE' | 'A_MODIFIER',
        commentaires
      );
    }
  }
}
