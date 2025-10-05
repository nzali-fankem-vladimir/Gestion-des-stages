import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { RapportHebdomadaireDto } from '../../core/services/rapport.service';

@Component({
  selector: 'app-enseignant-rapports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">Rapports à valider</h1>
          <p class="text-gray-600 mt-1">Gérez les rapports de stage qui vous sont assignés</p>
        </div>

        <div class="p-6">
          <!-- Filtres -->
          <div class="mb-6 flex flex-wrap gap-4">
            <select [(ngModel)]="selectedStatus" (change)="filterRapports()" 
                    class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Tous les statuts</option>
              <option value="SOUMIS">En attente</option>
              <option value="VALIDE">Validés</option>
              <option value="REJETE">Rejetés</option>
            </select>
          </div>

          <!-- Liste des rapports -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semaine</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date soumission</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let rapport of filteredRapports" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getEtudiantName(rapport) }}
                    </div>
                    <div class="text-sm text-gray-500" *ngIf="rapport.etudiantDetails?.email && !getEtudiantName(rapport).includes('@')">
                      {{ rapport.etudiantDetails?.email }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ rapport.stage?.entreprise?.nom || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Semaine {{ rapport.semaineNumero }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full" [ngClass]="getStatusClass(rapport.statut)">
                      {{ getStatusLabel(rapport.statut) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(rapport.dateSoumission) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button (click)="viewRapport(rapport)" 
                            class="text-indigo-600 hover:text-indigo-900">Voir</button>
                    <button *ngIf="rapport.statut === 'SOUMIS'" 
                            (click)="validateRapport(rapport)"
                            class="text-green-600 hover:text-green-900">Valider</button>
                    <button *ngIf="rapport.statut === 'SOUMIS'" 
                            (click)="requestModification(rapport)"
                            class="text-yellow-600 hover:text-yellow-900">À modifier</button>
                    <button *ngIf="rapport.statut === 'SOUMIS'" 
                            (click)="rejectRapport(rapport)"
                            class="text-red-600 hover:text-red-900">Rejeter</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="filteredRapports.length === 0" class="text-center py-8">
            <p class="text-gray-500">Aucun rapport trouvé</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de visualisation -->
    <ng-template #viewModal let-modal>
      <div class="modal-header" style="background: #4f46e5 !important; color: white !important; padding: 1.5rem 2rem !important; position: relative !important;">
        <h4 style="color: white !important; font-size: 1.5rem !important; font-weight: 600 !important; margin: 0 !important;">Détails du Rapport - Semaine {{ selectedRapport?.semaineNumero }}</h4>
        <button type="button" 
                style="position: absolute !important; top: 1.5rem !important; right: 2rem !important; color: white !important; background: none !important; border: none !important; font-size: 24px !important; cursor: pointer !important; opacity: 0.8 !important;"
                (click)="modal.dismiss()" 
                aria-label="Fermer">
          ×
        </button>
      </div>
      <div class="modal-body p-6" *ngIf="selectedRapport">
        <div class="space-y-6">
          <!-- En-tête avec informations principales -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Étudiant</label>
              <p class="text-gray-900 font-medium">{{ getEtudiantName(selectedRapport) }}</p>
              <p class="text-sm text-gray-500" *ngIf="selectedRapport.etudiantDetails?.email">
                {{ selectedRapport.etudiantDetails?.email }}
              </p>
            </div>
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Entreprise</label>
              <p class="text-gray-900 font-medium">{{ selectedRapport.stage?.entreprise?.nom || 'Non spécifiée' }}</p>
              <p class="text-sm text-gray-500" *ngIf="selectedRapport.stage?.entreprise?.email">
                {{ selectedRapport.stage?.entreprise?.email }}
              </p>
            </div>
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Période</label>
              <p class="text-gray-900">
                Du {{ formatDate(selectedRapport.dateDebutSemaine) }} au {{ formatDate(selectedRapport.dateFinSemaine) }}
              </p>
              <p class="text-sm text-gray-500">
                Soumis le {{ formatDate(selectedRapport.dateSoumission) }}
              </p>
            </div>
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Statut</label>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                    [ngClass]="getStatusClass(selectedRapport.statut)">
                {{ getStatusLabel(selectedRapport.statut) }}
              </span>
            </div>
          </div>

          <!-- Contenu du rapport -->
          <div class="space-y-6">
            <div *ngIf="selectedRapport.activitesRealisees" class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Activités réalisées</label>
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-gray-800 whitespace-pre-wrap leading-relaxed">{{ selectedRapport.activitesRealisees }}</p>
              </div>
            </div>

            <div *ngIf="selectedRapport.competencesAcquises" class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Compétences acquises</label>
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-gray-800 whitespace-pre-wrap leading-relaxed">{{ selectedRapport.competencesAcquises }}</p>
              </div>
            </div>

            <div *ngIf="selectedRapport.difficultes" class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Difficultés rencontrées</label>
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-gray-800 whitespace-pre-wrap leading-relaxed">{{ selectedRapport.difficultes }}</p>
              </div>
            </div>

            <div *ngIf="selectedRapport.objectifsSemaineSuivante" class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Objectifs semaine suivante</label>
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-gray-800 whitespace-pre-wrap leading-relaxed">{{ selectedRapport.objectifsSemaineSuivante }}</p>
              </div>
            </div>
          </div>

          <!-- Commentaires enseignant (si existants) -->
          <div *ngIf="selectedRapport.commentairesEnseignant" class="mt-6 pt-6 border-t border-gray-200">
            <h5 class="text-sm font-medium text-gray-700 mb-2">Vos commentaires</h5>
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p class="text-blue-800 whitespace-pre-wrap">{{ selectedRapport.commentairesEnseignant }}</p>
              <p class="text-xs text-blue-600 mt-2">
                Dernière modification : {{ formatDate(selectedRapport.updatedAt) || 'Non spécifiée' }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
        <button type="button" 
                (click)="modal.dismiss()"
                style="background: #6366f1 !important; color: white !important; border: 1px solid #6366f1 !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 100px !important;">
          Fermer
        </button>
      </div>
    </ng-template>

    <!-- Modal d'action (validation/modification/rejet) -->
    <ng-template #actionModal let-modal>
      <div class="modal-header" style="background: #4f46e5 !important; color: white !important; padding: 1.5rem 2rem !important; position: relative !important;">
        <h4 style="color: white !important; font-size: 1.5rem !important; font-weight: 600 !important; margin: 0 !important;">{{ actionTitle }}</h4>
        <button type="button" 
                style="position: absolute !important; top: 1.5rem !important; right: 2rem !important; color: white !important; background: none !important; border: none !important; font-size: 24px !important; cursor: pointer !important; opacity: 0.8 !important;"
                (click)="modal.dismiss()" 
                aria-label="Fermer">
          ×
        </button>
      </div>
      
      <div class="modal-body p-6">
        <div class="space-y-6">
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  {{ 
                    currentAction === 'validate' ? 'Votre commentaire sera visible par l\'étudiant et l\'entreprise.' :
                    currentAction === 'request-modification' ? 'Décrivez clairement les modifications demandées à l\'étudiant.' :
                    'Veuillez indiquer la raison du rejet de ce rapport.'
                  }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <label style="display: block !important; font-size: 14px !important; font-weight: 600 !important; color: #374151 !important; margin-bottom: 8px !important;">
              {{ currentAction === 'validate' ? 'Commentaires (optionnel)' : 'Commentaires' }}
              <span style="color: #ef4444 !important;" *ngIf="currentAction !== 'validate'">*</span>
            </label>
            <textarea 
              [(ngModel)]="actionComments"
              [required]="currentAction !== 'validate'"
              style="width: 100% !important; padding: 12px 16px !important; border: 2px solid #d1d5db !important; border-radius: 8px !important; font-size: 14px !important; line-height: 1.5 !important; background: white !important; color: #374151 !important; transition: all 0.2s ease !important; box-sizing: border-box !important; resize: vertical !important; min-height: 120px !important; font-family: inherit !important;"
              rows="5"
              [placeholder]="actionPlaceholder"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              {{ 
                currentAction === 'validate' ? 'Ces commentaires seront visibles par l\'étudiant et l\'entreprise.' :
                'Ces commentaires seront transmis à l\'étudiant.'
              }}
            </p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-end gap-4">
        <button 
          type="button" 
          (click)="modal.dismiss()"
          style="background: #9ca3af !important; color: white !important; border: 1px solid #9ca3af !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 100px !important; margin-right: 12px !important;"
        >
          Annuler
        </button>
        <button 
          type="button" 
          (click)="confirmAction(modal)"
          [disabled]="currentAction !== 'validate' && !actionComments.trim()"
          [style]="'background: ' + (currentAction === 'validate' ? '#16a34a' : currentAction === 'request-modification' ? '#ca8a04' : '#dc2626') + ' !important; color: white !important; border: 1px solid ' + (currentAction === 'validate' ? '#16a34a' : currentAction === 'request-modification' ? '#ca8a04' : '#dc2626') + ' !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 120px !important;' + ((currentAction !== 'validate' && !actionComments.trim()) ? ' opacity: 0.5 !important; cursor: not-allowed !important;' : '')"
        >
          <svg *ngIf="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSubmitting ? 'Traitement...' : actionButtonText }}
        </button>
      </div>
    </ng-template>
  `,
  styles: [`
    /* Modal Configuration */
    :host ::ng-deep .modal-dialog {
      max-width: 900px;
      margin: 1.75rem auto;
      position: relative;
      z-index: 1050;
    }
    
    :host ::ng-deep .modal-backdrop {
      display: none !important;
    }
    
    :host ::ng-deep .modal {
      background-color: rgba(0, 0, 0, 0.5) !important;
      backdrop-filter: blur(2px);
    }
    
    :host ::ng-deep .modal-content {
      border: none !important;
      border-radius: 12px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
      background-color: white !important;
      overflow: hidden;
    }
    
    /* Headers avec titres VISIBLES - Style comme l'exemple */
    :host ::ng-deep .modal-header {
      border-bottom: none !important;
      padding: 1.5rem 2rem !important;
      margin: 0 !important;
      border-radius: 12px 12px 0 0 !important;
      position: relative !important;
    }
    
    :host ::ng-deep .modal-header h4 {
      color: white !important;
      font-size: 1.5rem !important;
      font-weight: 600 !important;
      margin: 0 !important;
      text-shadow: none !important;
      letter-spacing: 0.025em !important;
    }
    
    /* Bouton fermeture VISIBLE - Style comme l'exemple */
    :host ::ng-deep .close-btn {
      position: absolute !important;
      top: 1.5rem !important;
      right: 2rem !important;
      color: white !important;
      background: none !important;
      border: none !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 24px !important;
      font-weight: 300 !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
      opacity: 0.8 !important;
    }
    
    :host ::ng-deep .close-btn:hover {
      opacity: 1 !important;
      transform: scale(1.1) !important;
    }
    
    /* Boutons Footer - Style comme l'exemple */
    :host ::ng-deep .cancel-btn {
      background: #9ca3af !important;
      color: white !important;
      border: 1px solid #9ca3af !important;
      padding: 12px 24px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
      min-width: 100px !important;
    }
    
    :host ::ng-deep .cancel-btn:hover {
      background: #6b7280 !important;
      border-color: #6b7280 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(156, 163, 175, 0.3) !important;
    }
    
    /* Bouton Fermer principal - Style bleu comme l'exemple */
    :host ::ng-deep .primary-btn {
      background: #6366f1 !important;
      color: white !important;
      border: 1px solid #6366f1 !important;
      padding: 12px 24px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
      min-width: 100px !important;
    }
    
    :host ::ng-deep .primary-btn:hover {
      background: #4f46e5 !important;
      border-color: #4f46e5 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
    }
    
    /* Body avec padding */
    :host ::ng-deep .modal-body {
      padding: 2rem !important;
      max-height: 70vh;
      overflow-y: auto;
      background-color: #f8fafc !important;
    }
    
    /* Focus des textarea */
    :host ::ng-deep textarea:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    /* Footer stylé */
    :host ::ng-deep .modal-footer {
      border-top: 1px solid #e5e7eb !important;
      padding: 1.5rem 2rem !important;
      margin: 0 !important;
      background: white !important;
      border-radius: 0 0 12px 12px !important;
    }
    
    /* Champs de saisie STYLÉS */
    :host ::ng-deep .modal textarea,
    :host ::ng-deep .modal input[type="text"],
    :host ::ng-deep .modal input[type="email"] {
      width: 100% !important;
      padding: 12px 16px !important;
      border: 2px solid #d1d5db !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      background: white !important;
      color: #374151 !important;
      transition: all 0.2s ease !important;
      box-sizing: border-box !important;
    }
    
    :host ::ng-deep .modal textarea:focus,
    :host ::ng-deep .modal input:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      background: white !important;
    }
    
    :host ::ng-deep .modal textarea::placeholder,
    :host ::ng-deep .modal input::placeholder {
      color: #9ca3af !important;
      opacity: 1 !important;
    }
    
    /* Labels stylés */
    :host ::ng-deep .modal label {
      display: block !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin-bottom: 8px !important;
    }
    
    /* Boutons STYLÉS avec couleurs distinctes */
    :host ::ng-deep .modal button {
      padding: 12px 24px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      transition: all 0.2s ease !important;
      border: none !important;
      cursor: pointer !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-width: 100px !important;
    }
    
    /* Bouton Fermer/Annuler - GRIS DISTINCT */
    :host ::ng-deep .modal-footer button:first-child {
      background: #6b7280 !important;
      color: white !important;
      border: 1px solid #6b7280 !important;
    }
    
    :host ::ng-deep .modal-footer button:first-child:hover {
      background: #4b5563 !important;
      border-color: #4b5563 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3) !important;
    }
    
    /* Boutons d'action colorés */
    :host ::ng-deep .modal-footer button.bg-green-600 {
      background: #16a34a !important;
      color: white !important;
    }
    
    :host ::ng-deep .modal-footer button.bg-green-600:hover {
      background: #15803d !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3) !important;
    }
    
    :host ::ng-deep .modal-footer button.bg-yellow-600 {
      background: #ca8a04 !important;
      color: white !important;
    }
    
    :host ::ng-deep .modal-footer button.bg-yellow-600:hover {
      background: #a16207 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(202, 138, 4, 0.3) !important;
    }
    
    :host ::ng-deep .modal-footer button.bg-red-600 {
      background: #dc2626 !important;
      color: white !important;
    }
    
    :host ::ng-deep .modal-footer button.bg-red-600:hover {
      background: #b91c1c !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3) !important;
    }
  `]
})
export class EnseignantRapportsPageComponent implements OnInit {
  @ViewChild('viewModal') viewModal!: TemplateRef<any>;
  @ViewChild('actionModal') actionModal!: TemplateRef<any>;

  rapports: RapportHebdomadaireDto[] = [];
  filteredRapports: RapportHebdomadaireDto[] = [];
  selectedRapport: RapportHebdomadaireDto | null = null;
  selectedStatus = '';

  isSubmitting: boolean = false;

  // Variables pour les actions
  currentAction = '';
  actionTitle = '';
  actionPlaceholder = '';
  actionButtonText = '';
  actionButtonClass = '';
  actionComments = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toast: ToastService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.loadRapports();
  }

  loadRapports() {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      console.error('❌ Aucun utilisateur connecté');
      return;
    }

    console.log('=== CHARGEMENT RAPPORTS ENSEIGNANT ===');
    console.log('User ID:', userId);
    console.log('URL appelée:', `${environment.apiUrl}/rapports-hebdomadaires/enseignant/${userId}`);

    // Récupérer les rapports assignés à cet enseignant
    this.http.get<RapportHebdomadaireDto[]>(`${environment.apiUrl}/rapports-hebdomadaires/enseignant/${userId}`).subscribe({
      next: (rapports) => {
        console.log('=== RAPPORTS REÇUS ===');
        console.log('Nombre total:', rapports.length);
        
        // Debug: afficher les détails de chaque rapport
        rapports.forEach((rapport, index) => {
          console.log(`Rapport ${index + 1}:`, {
            id: rapport.id,
            semaine: rapport.semaineNumero,
            statut: rapport.statut,
            enseignantDestinataire: rapport.enseignantDestinataire,
            etudiantDetails: rapport.etudiantDetails,
            dateSoumission: rapport.dateSoumission
          });
        });
        
        this.rapports = rapports;
        this.filterRapports();
        console.log('Rapports après filtrage:', this.filteredRapports.length);
      },
      error: (err) => {
        console.error('Erreur chargement rapports:', err);
        this.toast.show('Erreur lors du chargement des rapports', 'error');
      }
    });
  }

  filterRapports() {
    if (this.selectedStatus) {
      this.filteredRapports = this.rapports.filter(r => r.statut === this.selectedStatus);
    } else {
      this.filteredRapports = [...this.rapports];
    }
  }

  getEtudiantName(rapport: RapportHebdomadaireDto): string {
    if (rapport.etudiantDetails?.nom && rapport.etudiantDetails?.prenom) {
      return `${rapport.etudiantDetails.prenom} ${rapport.etudiantDetails.nom}`;
    }
    return rapport.etudiantDetails?.email || 'Étudiant';
  }

  getStatusLabel(status: string | undefined): string {
    const labels: { [key: string]: string } = {
      'BROUILLON': 'Brouillon',
      'SOUMIS': 'En attente',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté'
    };
    return labels[status || ''] || status || 'Non défini';
  }

  getStatusClass(status: string | undefined): string {
    const classes: { [key: string]: string } = {
      'BROUILLON': 'bg-gray-100 text-gray-800',
      'SOUMIS': 'bg-yellow-100 text-yellow-800',
      'VALIDE': 'bg-green-100 text-green-800',
      'REJETE': 'bg-red-100 text-red-800'
    };
    return classes[status || ''] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  viewRapport(rapport: RapportHebdomadaireDto) {
    this.selectedRapport = rapport;
    this.modalService.open(this.viewModal, { 
      size: 'lg',
      backdrop: false,
      keyboard: true
    });
  }

  validateRapport(rapport: RapportHebdomadaireDto) {
    this.selectedRapport = rapport;
    this.currentAction = 'validate';
    this.actionTitle = 'Valider le rapport';
    this.actionPlaceholder = 'Commentaires de validation (optionnel)';
    this.actionButtonText = 'Valider';
    this.actionButtonClass = 'bg-green-600';
    this.actionComments = '';
    this.modalService.open(this.actionModal, {
      backdrop: false,
      keyboard: true
    });
  }

  requestModification(rapport: RapportHebdomadaireDto) {
    this.selectedRapport = rapport;
    this.currentAction = 'request-modification';
    this.actionTitle = 'Demander des modifications';
    this.actionPlaceholder = 'Précisez les modifications à apporter...';
    this.actionButtonText = 'Demander modifications';
    this.actionButtonClass = 'bg-yellow-600';
    this.actionComments = '';
    this.modalService.open(this.actionModal, {
      backdrop: false,
      keyboard: true
    });
  }

  rejectRapport(rapport: RapportHebdomadaireDto) {
    this.selectedRapport = rapport;
    this.currentAction = 'reject';
    this.actionTitle = 'Rejeter le rapport';
    this.actionPlaceholder = 'Motif du rejet...';
    this.actionButtonText = 'Rejeter';
    this.actionButtonClass = 'bg-red-600';
    this.actionComments = '';
    this.modalService.open(this.actionModal, {
      backdrop: false,
      keyboard: true
    });
  }

  confirmAction(modal: any) {
    if (!this.selectedRapport) return;

    this.isSubmitting = true;

    let endpoint = '';
    let data: any = { commentaires: this.actionComments };

    switch (this.currentAction) {
      case 'validate':
        endpoint = `${environment.apiUrl}/rapports-hebdomadaires/${this.selectedRapport.id}/validate`;
        break;
      case 'request-modification':
        endpoint = `${environment.apiUrl}/rapports-hebdomadaires/${this.selectedRapport.id}/request-modification`;
        break;
      case 'reject':
        endpoint = `${environment.apiUrl}/rapports-hebdomadaires/${this.selectedRapport.id}/reject`;
        data = { reason: this.actionComments };
        break;
    }

    this.http.put(endpoint, data).subscribe({
      next: () => {
        this.toast.show('Action effectuée avec succès', 'success');
        modal.dismiss();
        this.loadRapports();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Erreur action:', err);
        this.toast.show('Erreur lors de l\'action', 'error');
        this.isSubmitting = false;
      }
    });
  }
}
