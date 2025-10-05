import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RapportHebdomadaireService } from '../../core/services/rapport-hebdomadaire.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { 
  RapportHebdomadaireDto, 
  RapportHebdomadaireEtendu,
  StatutRapport 
} from '../../core/models/rapport-hebdomadaire.interface';

@Component({
  selector: 'app-rapports-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Validation des Rapports Hebdomadaires</h1>
        <p class="text-gray-600 mt-1">Gérez et validez les rapports soumis par les étudiants</p>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow border">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <i class="fas fa-clock text-blue-600"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">En attente</p>
              <p class="text-xl font-semibold">{{statistics.enAttente}}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <i class="fas fa-check-circle text-green-600"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">Validés</p>
              <p class="text-xl font-semibold">{{statistics.valides}}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <i class="fas fa-times-circle text-red-600"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">Rejetés</p>
              <p class="text-xl font-semibold">{{statistics.rejetes}}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <div class="flex items-center">
            <div class="p-2 bg-gray-100 rounded-lg">
              <i class="fas fa-file-alt text-gray-600"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-xl font-semibold">{{statistics.total}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select [(ngModel)]="selectedStatut" (change)="filterRapports()" class="form-select">
              <option value="">Tous les statuts</option>
              <option value="SOUMIS">Soumis</option>
              <option value="VALIDE">Validés</option>
              <option value="REJETE">Rejetés</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="filterRapports()"
              placeholder="Nom étudiant, entreprise..."
              class="form-control">
          </div>
        </div>
      </div>

      <!-- Liste des rapports -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Rapports à Valider</h2>
        </div>
        
        <div *ngIf="filteredRapports.length === 0" class="p-8 text-center">
          <i class="fas fa-inbox text-gray-300 text-4xl mb-4"></i>
          <p class="text-gray-500">Aucun rapport à valider</p>
        </div>

        <div *ngIf="filteredRapports.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semaine</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soumis le</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let rapport of filteredRapports" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{rapport.etudiantPrenom}} {{rapport.etudiantNom}}
                      </div>
                      <div class="text-sm text-gray-500">{{rapport.etudiant?.email}}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">Semaine {{rapport.semaineNumero}}</div>
                  <div class="text-sm text-gray-500">{{rapport.semaineDateRange}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{rapport.stageTitle}}</div>
                  <div class="text-sm text-gray-500">{{rapport.entrepriseNom}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="'inline-flex px-2 py-1 text-xs font-semibold rounded-full ' + rapportService.getStatutBadgeClass(rapport.statut)">
                    {{rapport.statutLabel}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{formatDate(rapport.dateSoumission)}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      (click)="viewRapportDetails(rapport)"
                      class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                      Voir
                    </button>
                    <button 
                      *ngIf="rapport.statut === 'SOUMIS'"
                      (click)="validateRapport(rapport)"
                      class="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700">
                      Valider
                    </button>
                    <button 
                      *ngIf="rapport.statut === 'SOUMIS'"
                      (click)="requestModification(rapport)"
                      class="px-3 py-1 text-xs font-medium text-white bg-orange-600 rounded hover:bg-orange-700">
                      Modifier
                    </button>
                    <button 
                      *ngIf="rapport.statut === 'SOUMIS'"
                      (click)="rejectRapport(rapport)"
                      class="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700">
                      Rejeter
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Détails du Rapport -->
    <ng-template #rapportDetailsModal let-modal>
      <div class="modal-header" style="background: #2563eb !important; color: white !important; padding: 1.5rem 2rem !important; position: relative !important;">
        <h4 style="color: white !important; font-size: 1.5rem !important; font-weight: 600 !important; margin: 0 !important;">Détails du Rapport - Semaine {{selectedRapport?.semaineNumero}}</h4>
        <button type="button" 
                style="position: absolute !important; top: 1.5rem !important; right: 2rem !important; color: white !important; background: none !important; border: none !important; font-size: 24px !important; cursor: pointer !important; opacity: 0.8 !important;"
                (click)="modal.dismiss()" 
                aria-label="Fermer">
          ×
        </button>
      </div>
      <div class="modal-body p-6" *ngIf="selectedRapport">
        <div class="row mb-3">
          <div class="col-md-6">
            <strong>Étudiant:</strong> {{selectedRapport.etudiantPrenom}} {{selectedRapport.etudiantNom}}
          </div>
          <div class="col-md-6">
            <strong>Stage:</strong> {{selectedRapport.stageTitle}}
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-md-6">
            <strong>Entreprise:</strong> {{selectedRapport.entrepriseNom}}
          </div>
          <div class="col-md-6">
            <strong>Période:</strong> {{selectedRapport.semaineDateRange}}
          </div>
        </div>

        <div class="mb-3">
          <strong>Activités réalisées:</strong>
          <div class="mt-2 p-3 bg-light rounded">{{selectedRapport.activitesRealisees}}</div>
        </div>

        <div class="mb-3">
          <strong>Compétences acquises:</strong>
          <div class="mt-2 p-3 bg-light rounded">{{selectedRapport.competencesAcquises}}</div>
        </div>

        <div class="mb-3" *ngIf="selectedRapport.difficultes">
          <strong>Difficultés rencontrées:</strong>
          <div class="mt-2 p-3 bg-light rounded">{{selectedRapport.difficultes}}</div>
        </div>

        <div class="mb-3" *ngIf="selectedRapport.objectifsSemaineSuivante">
          <strong>Objectifs semaine suivante:</strong>
          <div class="mt-2 p-3 bg-light rounded">{{selectedRapport.objectifsSemaineSuivante}}</div>
        </div>

        <div class="mb-3" *ngIf="selectedRapport.hasFile">
          <strong>Fichier annexe:</strong>
          <div class="mt-2">
            <a [href]="rapportService.getFileUrl(selectedRapport.fichierUrl)" target="_blank" class="btn btn-outline-primary btn-sm">
              <i class="fas fa-download"></i> {{selectedRapport.nomFichier}}
            </a>
          </div>
        </div>

        <div class="mb-3" *ngIf="selectedRapport.commentairesEnseignant">
          <strong>Commentaires précédents:</strong>
          <div class="mt-2 p-3 bg-warning bg-opacity-10 rounded">{{selectedRapport.commentairesEnseignant}}</div>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-end gap-4">
        <div class="flex gap-2">
          <button type="button" 
                  style="background: #6366f1 !important; color: white !important; border: 1px solid #6366f1 !important; padding: 8px 16px !important; border-radius: 6px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important;"
                  (click)="modal.dismiss()">
            Fermer
          </button>
          <div class="flex gap-2" *ngIf="selectedRapport?.statut === 'SOUMIS'">
            <button type="button" 
                    style="background: #16a34a !important; color: white !important; border: 1px solid #16a34a !important; padding: 8px 16px !important; border-radius: 6px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important;"
                    (click)="validateRapportFromModal()">
              Valider
            </button>
            <button type="button" 
                    style="background: #ca8a04 !important; color: white !important; border: 1px solid #ca8a04 !important; padding: 8px 16px !important; border-radius: 6px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important;"
                    (click)="requestModificationFromModal()">
              Demander modification
            </button>
            <button type="button" 
                    style="background: #dc2626 !important; color: white !important; border: 1px solid #dc2626 !important; padding: 8px 16px !important; border-radius: 6px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important;"
                    (click)="rejectRapportFromModal()">
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </ng-template>

    <!-- Modal Validation -->
    <ng-template #validationModal let-modal>
      <div class="modal-header" style="background: #4f46e5 !important; color: white !important; padding: 1.5rem 2rem !important; position: relative !important;">
        <h4 style="color: white !important; font-size: 1.5rem !important; font-weight: 600 !important; margin: 0 !important;">Valider le Rapport</h4>
        <button type="button" 
                style="position: absolute !important; top: 1.5rem !important; right: 2rem !important; color: white !important; background: none !important; border: none !important; font-size: 24px !important; cursor: pointer !important; opacity: 0.8 !important;"
                (click)="modal.dismiss()" 
                aria-label="Fermer">
          ×
        </button>
      </div>
      <div class="modal-body p-6">
        <p>Êtes-vous sûr de vouloir valider ce rapport ?</p>
        <div class="mb-3">
          <label style="display: block !important; font-size: 14px !important; font-weight: 600 !important; color: #374151 !important; margin-bottom: 8px !important;">Commentaires (optionnel)</label>
          <textarea [(ngModel)]="validationComments" 
            style="width: 100% !important; padding: 12px 16px !important; border: 2px solid #d1d5db !important; border-radius: 8px !important; font-size: 14px !important; line-height: 1.5 !important; background: white !important; color: #374151 !important; transition: all 0.2s ease !important; box-sizing: border-box !important; resize: vertical !important; min-height: 100px !important; font-family: inherit !important;"
            rows="3" 
            placeholder="Ajoutez des commentaires pour l'étudiant..."
></textarea>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-end gap-4">
        <button type="button" 
                style="background: #9ca3af !important; color: white !important; border: 1px solid #9ca3af !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 100px !important;" 
                (click)="modal.dismiss()">
          Annuler
        </button>
        <button type="button" 
                style="background: #16a34a !important; color: white !important; border: 1px solid #16a34a !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 100px !important;"
                (click)="confirmValidation()" 
                [disabled]="isLoading">
          <i *ngIf="isLoading" class="fas fa-spinner fa-spin me-2"></i>
          Valider
        </button>
      </div>
    </ng-template>

    <!-- Modal Demande de Modification -->
    <ng-template #modificationModal let-modal>
      <div class="modal-header" style="background: #4f46e5 !important; color: white !important; padding: 1.5rem 2rem !important; position: relative !important;">
        <h4 style="color: white !important; font-size: 1.5rem !important; font-weight: 600 !important; margin: 0 !important;">Demander une Modification</h4>
        <button type="button" 
                style="position: absolute !important; top: 1.5rem !important; right: 2rem !important; color: white !important; background: none !important; border: none !important; font-size: 24px !important; cursor: pointer !important; opacity: 0.8 !important;"
                (click)="modal.dismiss()" 
                aria-label="Fermer">
          ×
        </button>
      </div>
      <div class="modal-body p-6">
        <div class="mb-3">
          <label style="display: block !important; font-size: 14px !important; font-weight: 600 !important; color: #374151 !important; margin-bottom: 8px !important;">Commentaires <span style="color: #ef4444 !important;">*</span></label>
          <textarea [(ngModel)]="modificationComments" 
            style="width: 100% !important; padding: 12px 16px !important; border: 2px solid #d1d5db !important; border-radius: 8px !important; font-size: 14px !important; line-height: 1.5 !important; background: white !important; color: #374151 !important; transition: all 0.2s ease !important; box-sizing: border-box !important; resize: vertical !important; min-height: 120px !important; font-family: inherit !important;"
            rows="4" 
            placeholder="Expliquez les modifications à apporter..." 
            required
></textarea>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-end gap-4">
        <button type="button" 
                style="background: #9ca3af !important; color: white !important; border: 1px solid #9ca3af !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 100px !important;" 
                (click)="modal.dismiss()">
          Annuler
        </button>
        <button type="button" 
                style="background: #ca8a04 !important; color: white !important; border: 1px solid #ca8a04 !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 100px !important;"
                (click)="confirmModification()" 
                [disabled]="!modificationComments || isLoading">
          <i *ngIf="isLoading" class="fas fa-spinner fa-spin me-2"></i>
          Demander modification
        </button>
      </div>
    </ng-template>

    <!-- Modal Rejet -->
    <ng-template #rejectionModal let-modal>
      <div class="modal-header" style="background: #4f46e5 !important; color: white !important; padding: 1.5rem 2rem !important; position: relative !important;">
        <h4 style="color: white !important; font-size: 1.5rem !important; font-weight: 600 !important; margin: 0 !important;">Rejeter le Rapport</h4>
        <button type="button" 
                style="position: absolute !important; top: 1.5rem !important; right: 2rem !important; color: white !important; background: none !important; border: none !important; font-size: 24px !important; cursor: pointer !important; opacity: 0.8 !important;"
                (click)="modal.dismiss()" 
                aria-label="Fermer">
          ×
        </button>
      </div>
      <div class="modal-body p-6">
        <div class="mb-3">
          <label style="display: block !important; font-size: 14px !important; font-weight: 600 !important; color: #374151 !important; margin-bottom: 8px !important;">Raison du rejet <span style="color: #ef4444 !important;">*</span></label>
          <textarea [(ngModel)]="rejectionReason" 
            style="width: 100% !important; padding: 12px 16px !important; border: 2px solid #d1d5db !important; border-radius: 8px !important; font-size: 14px !important; line-height: 1.5 !important; background: white !important; color: #374151 !important; transition: all 0.2s ease !important; box-sizing: border-box !important; resize: vertical !important; min-height: 120px !important; font-family: inherit !important;"
            rows="4" 
            placeholder="Expliquez pourquoi ce rapport est rejeté..." 
            required
></textarea>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-end gap-4">
        <button type="button" 
                style="background: #9ca3af !important; color: white !important; border: 1px solid #9ca3af !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 100px !important;" 
                (click)="modal.dismiss()">
          Annuler
        </button>
        <button type="button" 
                style="background: #dc2626 !important; color: white !important; border: 1px solid #dc2626 !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 100px !important;"
                (click)="confirmRejection()" 
                [disabled]="!rejectionReason || isLoading">
          <i *ngIf="isLoading" class="fas fa-spinner fa-spin me-2"></i>
          Rejeter
        </button>
      </div>
    </ng-template>
  `,
  styles: [`
    .modal-no-backdrop {
      background: rgba(0, 0, 0, 0.5) !important;
    }
    .btn-close-white {
      filter: invert(1);
    }
    
    /* Toast Notifications */
    :host ::ng-deep .toast-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(400px);
      transition: transform 0.3s ease;
      color: white;
      font-weight: 500;
    }
    
    :host ::ng-deep .toast-notification.show {
      transform: translateX(0);
    }
    
    :host ::ng-deep .toast-success {
      background: linear-gradient(135deg, #10b981, #059669);
    }
    
    :host ::ng-deep .toast-error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    :host ::ng-deep .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    :host ::ng-deep .toast-content i {
      font-size: 18px;
    }
    
    /* Modal Styles - Matching Reference Design */
    :host ::ng-deep .modal-dialog {
      max-width: 800px;
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
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
      background: white !important;
      overflow: hidden !important;
    }
    
    :host ::ng-deep .modal-header {
      border-bottom: none !important;
      padding: 0 !important;
      margin: 0 !important;
      border-radius: 0 !important;
      position: relative !important;
    }
    
    :host ::ng-deep .modal-title {
      font-weight: 600 !important;
      font-size: 1.25rem !important;
      margin: 0 !important;
      color: white !important;
    }
    
    :host ::ng-deep .btn-close {
      background: none !important;
      border: none !important;
      color: white !important;
      font-size: 24px !important;
      opacity: 0.8 !important;
      padding: 0 !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    :host ::ng-deep .btn-close:hover {
      opacity: 1 !important;
      background: rgba(255, 255, 255, 0.1) !important;
      border-radius: 4px !important;
    }
    
    :host ::ng-deep .btn-close svg {
      width: 20px !important;
      height: 20px !important;
      stroke: white !important;
    }
    
    :host ::ng-deep .modal-body {
      padding: 32px 24px !important;
      background: #f8fafc !important;
    }
    
    :host ::ng-deep .modal-footer {
      border-top: none !important;
      padding: 0 !important;
      margin: 0 !important;
      border-radius: 0 !important;
    }
    
    /* Styles spécifiques pour les titres colorés */
    :host ::ng-deep .modal-header.bg-green-600 h4,
    :host ::ng-deep .modal-header.bg-yellow-600 h4,
    :host ::ng-deep .modal-header.bg-red-600 h4,
    :host ::ng-deep .modal-header.bg-blue-600 h4 {
      color: white !important;
      font-weight: 600 !important;
    }
    
    /* Form Styles */
    :host ::ng-deep .form-label {
      font-weight: 700 !important;
      color: #1f2937 !important;
      margin-bottom: 8px !important;
      font-size: 15px !important;
      display: block !important;
    }
    
    :host ::ng-deep .form-control {
      border: 2px solid #d1d5db !important;
      border-radius: 8px !important;
      padding: 14px 16px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
      background: white !important;
      color: #374151 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    
    :host ::ng-deep .form-control:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      outline: none !important;
      background: white !important;
    }
    
    :host ::ng-deep textarea.form-control {
      min-height: 100px !important;
      resize: vertical !important;
      font-family: inherit !important;
      line-height: 1.5 !important;
    }
    
    /* Button Styles - Matching Reference Design */
    :host ::ng-deep .btn {
      padding: 12px 24px !important;
      border-radius: 8px !important;
      font-weight: 500 !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
      border: 1px solid transparent !important;
      cursor: pointer !important;
      text-decoration: none !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-width: 80px !important;
      height: 40px !important;
    }
    
    :host ::ng-deep .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
      color: white !important;
      border: none !important;
    }
    
    :host ::ng-deep .btn-primary:hover {
      background: linear-gradient(135deg, #5b5cf6, #4338ca) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3) !important;
      color: white !important;
    }
    
    :host ::ng-deep .btn-secondary {
      background: white !important;
      color: #6b7280 !important;
      border: 1px solid #d1d5db !important;
    }
    
    :host ::ng-deep .btn-secondary:hover {
      background: #f9fafb !important;
      color: #374151 !important;
      border-color: #9ca3af !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    }
    
    :host ::ng-deep .btn-success {
      background: linear-gradient(135deg, #10b981, #059669) !important;
      color: white !important;
      border: none !important;
    }
    
    :host ::ng-deep .btn-success:hover {
      background: linear-gradient(135deg, #059669, #047857) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3) !important;
      color: white !important;
    }
    
    :host ::ng-deep .btn-warning {
      background: linear-gradient(135deg, #f59e0b, #d97706) !important;
      color: white !important;
      border: none !important;
    }
    
    :host ::ng-deep .btn-warning:hover {
      background: linear-gradient(135deg, #d97706, #b45309) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3) !important;
      color: white !important;
    }
    
    :host ::ng-deep .btn-danger {
      background: linear-gradient(135deg, #ef4444, #dc2626) !important;
      color: white !important;
      border: none !important;
    }
    
    :host ::ng-deep .btn-danger:hover {
      background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3) !important;
      color: white !important;
    }
    
    /* Content Sections */
    :host ::ng-deep .text-primary {
      color: #3b82f6 !important;
      font-weight: 600;
    }
    
    :host ::ng-deep .bg-light {
      background: white !important;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    
    /* FORCE STYLES - Ultra spécifique */
    :host ::ng-deep .modal .form-label {
      color: #1f2937 !important;
      font-weight: 700 !important;
      font-size: 16px !important;
      margin-bottom: 8px !important;
      display: block !important;
    }
    
    :host ::ng-deep .modal .form-control {
      background-color: white !important;
      border: 3px solid #9ca3af !important;
      color: #374151 !important;
      font-size: 14px !important;
      padding: 12px !important;
      border-radius: 6px !important;
    }
    
    :host ::ng-deep .modal .btn {
      font-weight: 600 !important;
      padding: 12px 20px !important;
      border-radius: 6px !important;
      margin: 4px !important;
    }
    
    :host ::ng-deep .modal .btn-primary {
      background-color: #3b82f6 !important;
      border-color: #3b82f6 !important;
      color: white !important;
    }
    
    :host ::ng-deep .modal .btn-secondary {
      background-color: #6b7280 !important;
      border-color: #6b7280 !important;
      color: white !important;
    }
    
    :host ::ng-deep .modal .btn-success {
      background-color: #10b981 !important;
      border-color: #10b981 !important;
      color: white !important;
    }
    
    :host ::ng-deep .modal .btn-warning {
      background-color: #f59e0b !important;
      border-color: #f59e0b !important;
      color: white !important;
    }
    
    :host ::ng-deep .modal .btn-danger {
      background-color: #ef4444 !important;
      border-color: #ef4444 !important;
      color: white !important;
    }
    
    /* CORRECTIONS SPÉCIFIQUES POUR VISIBILITÉ - Style comme l'exemple */
    
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
    
    /* Champs de saisie améliorés */
    :host ::ng-deep .modal .form-control:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      background: white !important;
    }
    
    /* Focus des textarea avec styles inline */
    :host ::ng-deep textarea:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
  `]
})
export class RapportsValidationPageComponent implements OnInit {
  @ViewChild('rapportDetailsModal') rapportDetailsModal!: TemplateRef<any>;
  @ViewChild('validationModal') validationModal!: TemplateRef<any>;
  @ViewChild('modificationModal') modificationModal!: TemplateRef<any>;
  @ViewChild('rejectionModal') rejectionModal!: TemplateRef<any>;

  rapports: RapportHebdomadaireEtendu[] = [];
  filteredRapports: RapportHebdomadaireEtendu[] = [];
  selectedRapport: RapportHebdomadaireEtendu | null = null;
  
  selectedStatut = '';
  searchTerm = '';
  isLoading = false;
  
  validationComments = '';
  modificationComments = '';
  rejectionReason = '';

  statistics = {
    total: 0,
    enAttente: 0,
    valides: 0,
    rejetes: 0
  };

  constructor(
    public rapportService: RapportHebdomadaireService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadRapports();
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    console.log(`${type.toUpperCase()}: ${message}`);
    this.showToast(message, type);
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  loadRapports(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.rapportService.getRapportsByEnseignantId(currentUser.id).subscribe({
        next: (rapports) => {
          this.rapports = rapports.map(r => this.rapportService.toRapportEtendu(r));
          this.filterRapports();
          this.updateStatistics();
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des rapports:', error);
          this.showMessage('Erreur lors du chargement des rapports', 'error');
        }
      });
    }
  }

  filterRapports(): void {
    this.filteredRapports = this.rapports.filter(rapport => {
      const matchesStatut = !this.selectedStatut || rapport.statut === this.selectedStatut;
      const matchesSearch = !this.searchTerm || 
        rapport.etudiantNom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        rapport.etudiantPrenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        rapport.entrepriseNom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        rapport.stageTitle?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatut && matchesSearch;
    });
  }

  private updateStatistics(): void {
    this.statistics = {
      total: this.rapports.length,
      enAttente: this.rapports.filter(r => r.statut === StatutRapport.SOUMIS).length,
      valides: this.rapports.filter(r => r.statut === StatutRapport.VALIDE).length,
      rejetes: this.rapports.filter(r => r.statut === StatutRapport.REJETE).length
    };
  }

  viewRapportDetails(rapport: RapportHebdomadaireEtendu): void {
    this.selectedRapport = rapport;
    this.modalService.open(this.rapportDetailsModal, { 
      size: 'lg',
      backdrop: false,
      windowClass: 'modal-no-backdrop'
    });
  }

  validateRapport(rapport: RapportHebdomadaireEtendu): void {
    this.selectedRapport = rapport;
    this.validationComments = '';
    this.modalService.open(this.validationModal, { 
      backdrop: false,
      windowClass: 'modal-no-backdrop'
    });
  }

  requestModification(rapport: RapportHebdomadaireEtendu): void {
    this.selectedRapport = rapport;
    this.modificationComments = '';
    this.modalService.open(this.modificationModal, { 
      backdrop: false,
      windowClass: 'modal-no-backdrop'
    });
  }

  rejectRapport(rapport: RapportHebdomadaireEtendu): void {
    this.selectedRapport = rapport;
    this.rejectionReason = '';
    this.modalService.open(this.rejectionModal, { 
      backdrop: false,
      windowClass: 'modal-no-backdrop'
    });
  }

  confirmValidation(): void {
    if (!this.selectedRapport?.id) return;

    this.isLoading = true;
    this.rapportService.validateRapport(this.selectedRapport.id, {
      commentaires: this.validationComments
    }).subscribe({
      next: () => {
        this.showMessage('Rapport validé avec succès');
        this.loadRapports();
        this.isLoading = false;
        this.modalService.dismissAll();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la validation:', error);
        this.showMessage('Erreur lors de la validation du rapport', 'error');
        this.isLoading = false;
      }
    });
  }

  confirmModification(): void {
    if (!this.selectedRapport?.id || !this.modificationComments) return;

    this.isLoading = true;
    this.rapportService.requestModification(this.selectedRapport.id, {
      commentaires: this.modificationComments
    }).subscribe({
      next: () => {
        this.showMessage('Demande de modification envoyée');
        this.loadRapports();
        this.isLoading = false;
        this.modalService.dismissAll();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la demande de modification:', error);
        this.showMessage('Erreur lors de la demande de modification', 'error');
        this.isLoading = false;
      }
    });
  }

  confirmRejection(): void {
    if (!this.selectedRapport?.id || !this.rejectionReason) return;

    this.isLoading = true;
    this.rapportService.rejectRapport(this.selectedRapport.id, {
      reason: this.rejectionReason
    }).subscribe({
      next: () => {
        this.showMessage('Rapport rejeté');
        this.loadRapports();
        this.isLoading = false;
        this.modalService.dismissAll();
      },
      error: (error) => {
        console.error('❌ Erreur lors du rejet:', error);
        this.showMessage('Erreur lors du rejet du rapport', 'error');
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Méthodes wrapper pour les actions depuis la modal de détails
  validateRapportFromModal(): void {
    if (this.selectedRapport) {
      this.modalService.dismissAll();
      this.validateRapport(this.selectedRapport);
    }
  }

  requestModificationFromModal(): void {
    if (this.selectedRapport) {
      this.modalService.dismissAll();
      this.requestModification(this.selectedRapport);
    }
  }

  rejectRapportFromModal(): void {
    if (this.selectedRapport) {
      this.modalService.dismissAll();
      this.rejectRapport(this.selectedRapport);
    }
  }
}
