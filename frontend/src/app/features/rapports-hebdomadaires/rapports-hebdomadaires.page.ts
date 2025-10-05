import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RapportHebdomadaireService } from '../../core/services/rapport-hebdomadaire.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { 
  RapportHebdomadaireDto, 
  RapportHebdomadaireEtendu,
  RapportHebdomadaireCreateRequest,
  StatutRapport 
} from '../../core/models/rapport-hebdomadaire.interface';

@Component({
  selector: 'app-rapports-hebdomadaires',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mes Rapports Hebdomadaires</h1>
          <p class="text-gray-600 mt-1">Gérez vos rapports de stage hebdomadaires</p>
        </div>
        <button 
          (click)="openCreateModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <i class="fas fa-plus"></i>
          Nouveau Rapport
        </button>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        <div class="bg-white p-4 rounded-lg shadow border">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <i class="fas fa-paper-plane text-blue-600"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">Soumis</p>
              <p class="text-xl font-semibold">{{statistics.soumis}}</p>
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
            <div class="p-2 bg-yellow-100 rounded-lg">
              <i class="fas fa-edit text-yellow-600"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">Brouillons</p>
              <p class="text-xl font-semibold">{{statistics.brouillons}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des rapports -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Liste des Rapports</h2>
        </div>
        
        <div *ngIf="rapports.length === 0" class="p-8 text-center">
          <i class="fas fa-file-alt text-gray-300 text-4xl mb-4"></i>
          <p class="text-gray-500">Aucun rapport hebdomadaire créé</p>
          <button 
            (click)="openCreateModal()"
            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Créer votre premier rapport
          </button>
        </div>

        <div *ngIf="rapports.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semaine</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fichier</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let rapport of rapports" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">Semaine {{rapport.semaineNumero}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{rapport.semaineDateRange}}</div>
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
                <td class="px-6 py-4 whitespace-nowrap">
                  <div *ngIf="rapport.hasFile" class="flex items-center text-sm text-gray-900">
                    <i class="fas fa-paperclip text-gray-400 mr-2"></i>
                    {{rapport.nomFichier}}
                  </div>
                  <span *ngIf="!rapport.hasFile" class="text-sm text-gray-400">Aucun fichier</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      (click)="viewRapport(rapport)"
                      class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                      Voir
                    </button>
                    <button 
                      *ngIf="rapport.canEdit"
                      (click)="editRapport(rapport)"
                      class="px-3 py-1 text-xs font-medium text-white bg-orange-600 rounded hover:bg-orange-700">
                      Éditer
                    </button>
                    <button 
                      *ngIf="rapport.canSubmit"
                      (click)="submitRapport(rapport)"
                      class="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700">
                      Soumettre
                    </button>
                    <button 
                      *ngIf="rapport.canEdit"
                      (click)="deleteRapport(rapport)"
                      class="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Création/Édition -->
    <ng-template #rapportModal let-modal>
      <div class="modal-header bg-blue-600 text-white">
        <h4 class="modal-title">{{isEditMode ? 'Modifier' : 'Créer'}} un Rapport Hebdomadaire</h4>
        <button type="button" class="btn-close btn-close-white" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="rapportForm" (ngSubmit)="saveRapport()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Numéro de semaine *</label>
              <input type="number" class="form-control" formControlName="semaineNumero" min="1" max="52">
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Date début *</label>
              <input type="date" class="form-control" formControlName="dateDebutSemaine">
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Date fin *</label>
              <input type="date" class="form-control" formControlName="dateFinSemaine">
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold">Activités réalisées *</label>
            <div class="form-text mb-2">Décrivez en détail les activités que vous avez réalisées cette semaine</div>
            <textarea class="form-control" formControlName="activitesRealisees" rows="4"></textarea>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold">Compétences acquises *</label>
            <div class="form-text mb-2">Quelles compétences avez-vous développées ou acquises ?</div>
            <textarea class="form-control" formControlName="competencesAcquises" rows="3"></textarea>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold">Difficultés rencontrées</label>
            <div class="form-text mb-2">Décrivez les difficultés rencontrées et comment vous les avez surmontées</div>
            <textarea class="form-control" formControlName="difficultes" rows="3"></textarea>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold">Objectifs pour la semaine suivante</label>
            <div class="form-text mb-2">Quels sont vos objectifs pour la semaine prochaine ?</div>
            <textarea class="form-control" formControlName="objectifsSemaineSuivante" rows="3"></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label">Fichier annexe (optionnel)</label>
            <input type="file" class="form-control" (change)="onFileSelected($event)" 
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
            <div class="form-text">Formats acceptés : PDF, Word, Images (max 10MB)</div>
            <div *ngIf="selectedFile" class="mt-2 p-2 bg-light rounded">
              <i class="fas fa-paperclip"></i> {{selectedFile.name}} ({{formatFileSize(selectedFile.size)}})
              <button type="button" class="btn btn-sm btn-outline-danger ms-2" (click)="removeFile()">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">Annuler</button>
        <button type="button" class="btn btn-primary" (click)="saveRapport()" [disabled]="rapportForm.invalid || isLoading">
          <i *ngIf="isLoading" class="fas fa-spinner fa-spin me-2"></i>
          {{isEditMode ? 'Mettre à jour' : 'Créer'}}
        </button>
      </div>
    </ng-template>

    <!-- Modal Détails Rapport -->
    <ng-template #rapportDetailsModal let-modal>
      <div class="modal-header bg-blue-600 text-white">
        <h4 class="modal-title">Détails du Rapport - Semaine {{selectedRapport?.semaineNumero}}</h4>
        <button type="button" class="btn-close btn-close-white" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body p-6">
        <div *ngIf="selectedRapport">
          <!-- Informations générales en cards -->
          <div class="row mb-4">
            <div class="col-md-6 mb-3">
              <div class="card border-0 bg-light">
                <div class="card-body p-3">
                  <h6 class="card-title text-muted mb-1">Semaine</h6>
                  <p class="card-text fw-bold">Semaine {{selectedRapport.semaineNumero}}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="card border-0 bg-light">
                <div class="card-body p-3">
                  <h6 class="card-title text-muted mb-1">Période</h6>
                  <p class="card-text fw-bold">{{selectedRapport.semaineDateRange}}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="card border-0 bg-light">
                <div class="card-body p-3">
                  <h6 class="card-title text-muted mb-1">Stage</h6>
                  <p class="card-text fw-bold">{{selectedRapport.stageTitle}}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="card border-0 bg-light">
                <div class="card-body p-3">
                  <h6 class="card-title text-muted mb-1">Statut</h6>
                  <span [class]="'badge ' + rapportService.getStatutBadgeClass(selectedRapport.statut)">
                    {{selectedRapport.statutLabel}}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenu du rapport -->
          <div class="mb-4">
            <h5 class="mb-3">Contenu du rapport</h5>
            
            <div class="mb-3">
              <h6 class="text-primary">Activités réalisées</h6>
              <div class="p-3 bg-light rounded">
                <p class="mb-0">{{selectedRapport.activitesRealisees || 'Non renseigné'}}</p>
              </div>
            </div>
            
            <div class="mb-3">
              <h6 class="text-primary">Compétences acquises</h6>
              <div class="p-3 bg-light rounded">
                <p class="mb-0">{{selectedRapport.competencesAcquises || 'Non renseigné'}}</p>
              </div>
            </div>
            
            <div class="mb-3">
              <h6 class="text-primary">Difficultés rencontrées</h6>
              <div class="p-3 bg-light rounded">
                <p class="mb-0">{{selectedRapport.difficultes || 'Aucune difficulté signalée'}}</p>
              </div>
            </div>
            
            <div class="mb-3">
              <h6 class="text-primary">Objectifs semaine suivante</h6>
              <div class="p-3 bg-light rounded">
                <p class="mb-0">{{selectedRapport.objectifsSemaineSuivante || 'Non renseigné'}}</p>
              </div>
            </div>
          </div>

          <!-- Fichier joint -->
          <div *ngIf="selectedRapport.hasFile" class="mb-3">
            <h6 class="text-primary">Fichier joint</h6>
            <div class="d-flex align-items-center p-3 bg-light rounded">
              <i class="fas fa-paperclip text-muted me-2"></i>
              <span class="me-2">{{selectedRapport.nomFichier}}</span>
              <button class="btn btn-sm btn-outline-primary">
                <i class="fas fa-download me-1"></i>Télécharger
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">Fermer</button>
        <button 
          *ngIf="selectedRapport?.canEdit"
          type="button" 
          class="btn btn-primary" 
          (click)="editFromModal()">
          <i class="fas fa-edit me-1"></i>Modifier
        </button>
      </div>
    </ng-template>
  `,
  styles: [`
    .modal-no-backdrop {
      background: rgba(0, 0, 0, 0.5) !important;
    }
    .modal-header {
      border-bottom: none;
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
    :host ::ng-deep .modal-content {
      border: none !important;
      border-radius: 12px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
      background: white !important;
      overflow: hidden !important;
    }
    
    :host ::ng-deep .modal-header {
      background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
      color: white !important;
      border-radius: 0 !important;
      padding: 20px 24px !important;
      border-bottom: none !important;
      position: relative !important;
    }
    
    :host ::ng-deep .modal-title {
      font-weight: 600 !important;
      font-size: 1.25rem !important;
      margin: 0 !important;
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
    
    :host ::ng-deep .modal-body {
      padding: 32px 24px !important;
      background: #f8fafc !important;
    }
    
    :host ::ng-deep .modal-footer {
      background: white !important;
      border-top: 1px solid #e5e7eb !important;
      border-radius: 0 !important;
      padding: 20px 24px !important;
      display: flex !important;
      justify-content: flex-end !important;
      gap: 12px !important;
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
    
    :host ::ng-deep .form-text {
      color: #6b7280 !important;
      font-size: 13px !important;
      font-style: italic !important;
      margin-top: 4px !important;
      display: block !important;
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
    
    /* Card Styles for Details Modal */
    :host ::ng-deep .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    
    :host ::ng-deep .card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    :host ::ng-deep .card-body {
      padding: 16px;
    }
    
    :host ::ng-deep .card-title {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    :host ::ng-deep .card-text {
      font-size: 14px;
      color: #1f2937;
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
    
    /* Section Dividers */
    :host ::ng-deep .mb-4 {
      margin-bottom: 24px !important;
      padding: 16px !important;
      background: white !important;
      border-radius: 8px !important;
      border: 1px solid #e5e7eb !important;
    }
    
    /* Input File Styling */
    :host ::ng-deep input[type="file"] {
      border: 2px dashed #d1d5db !important;
      background: #f9fafb !important;
      padding: 20px !important;
      border-radius: 8px !important;
      text-align: center !important;
    }
    
    :host ::ng-deep input[type="file"]:hover {
      border-color: #3b82f6 !important;
      background: #eff6ff !important;
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
    
    /* Confirm Modal */
    :host ::ng-deep .confirm-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    :host ::ng-deep .confirm-modal-overlay.show {
      opacity: 1;
    }
    
    :host ::ng-deep .confirm-modal {
      background: white;
      border-radius: 8px;
      min-width: 400px;
      max-width: 500px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }
    
    :host ::ng-deep .confirm-modal-overlay.show .confirm-modal {
      transform: scale(1);
    }
    
    :host ::ng-deep .confirm-header {
      padding: 20px 24px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    :host ::ng-deep .confirm-header h5 {
      margin: 0 0 16px 0;
      color: #374151;
      font-weight: 600;
    }
    
    :host ::ng-deep .confirm-body {
      padding: 20px 24px;
    }
    
    :host ::ng-deep .confirm-body p {
      margin: 0;
      color: #6b7280;
      line-height: 1.5;
    }
    
    :host ::ng-deep .confirm-footer {
      padding: 0 24px 20px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
  `]
})
export class RapportsHebdomadairesPageComponent implements OnInit {
  @ViewChild('rapportModal') rapportModal!: TemplateRef<any>;
  @ViewChild('rapportDetailsModal') rapportDetailsModal!: TemplateRef<any>;

  rapports: RapportHebdomadaireEtendu[] = [];
  rapportForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  selectedFile: File | null = null;
  currentRapport: RapportHebdomadaireDto | null = null;
  selectedRapport: RapportHebdomadaireEtendu | null = null;
  modalRef: NgbModalRef | null = null;

  statistics = {
    total: 0,
    brouillons: 0,
    soumis: 0,
    valides: 0,
    rejetes: 0
  };

  constructor(
    public rapportService: RapportHebdomadaireService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.rapportForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadRapports();
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    console.log(`${type.toUpperCase()}: ${message}`);
    this.showToast(message, type);
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    // Créer l'élément toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;

    // Ajouter au body
    document.body.appendChild(toast);

    // Animation d'entrée
    setTimeout(() => toast.classList.add('show'), 100);

    // Suppression automatique après 3 secondes
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      semaineNumero: ['', [Validators.required, Validators.min(1), Validators.max(52)]],
      dateDebutSemaine: ['', Validators.required],
      dateFinSemaine: ['', Validators.required],
      activitesRealisees: ['', Validators.required],
      competencesAcquises: ['', Validators.required],
      difficultes: [''],
      objectifsSemaineSuivante: ['']
    });
  }

  loadRapports(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.rapportService.getRapportsByEtudiantId(currentUser.id).subscribe({
        next: (rapports) => {
          this.rapports = rapports.map(r => this.rapportService.toRapportEtendu(r));
          this.updateStatistics();
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des rapports:', error);
          this.showMessage('Erreur lors du chargement des rapports', 'error');
        }
      });
    }
  }

  private updateStatistics(): void {
    this.statistics = {
      total: this.rapports.length,
      brouillons: this.rapports.filter(r => r.statut === StatutRapport.BROUILLON).length,
      soumis: this.rapports.filter(r => r.statut === StatutRapport.SOUMIS).length,
      valides: this.rapports.filter(r => r.statut === StatutRapport.VALIDE).length,
      rejetes: this.rapports.filter(r => r.statut === StatutRapport.REJETE).length
    };
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentRapport = null;
    this.rapportForm.reset();
    this.selectedFile = null;
    this.modalRef = this.modalService.open(this.rapportModal, { 
      size: 'lg',
      backdrop: false,
      windowClass: 'modal-no-backdrop'
    });
  }

  editRapport(rapport: RapportHebdomadaireEtendu): void {
    this.isEditMode = true;
    this.currentRapport = rapport;
    this.rapportForm.patchValue({
      semaineNumero: rapport.semaineNumero,
      dateDebutSemaine: rapport.dateDebutSemaine,
      dateFinSemaine: rapport.dateFinSemaine,
      activitesRealisees: rapport.activitesRealisees,
      competencesAcquises: rapport.competencesAcquises,
      difficultes: rapport.difficultes,
      objectifsSemaineSuivante: rapport.objectifsSemaineSuivante
    });
    this.selectedFile = null;
    this.modalRef = this.modalService.open(this.rapportModal, { 
      size: 'lg',
      backdrop: false,
      windowClass: 'modal-no-backdrop'
    });
  }

  saveRapport(): void {
    if (this.rapportForm.invalid) return;

    this.isLoading = true;
    const formData = this.rapportForm.value;

    if (this.isEditMode && this.currentRapport?.id) {
      this.rapportService.updateRapport(this.currentRapport.id, formData, this.selectedFile || undefined).subscribe({
        next: () => {
          this.showMessage('Rapport mis à jour avec succès');
          this.modalRef?.close();
          this.loadRapports();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erreur lors de la mise à jour:', error);
          this.showMessage('Erreur lors de la mise à jour du rapport', 'error');
          this.isLoading = false;
        }
      });
    } else {
      const currentUser = this.authService.getCurrentUser();
      const createRequest: RapportHebdomadaireCreateRequest = {
        ...formData,
        etudiantId: currentUser?.id || 0,
        offreId: 1 // TODO: Récupérer l'ID de l'offre de stage active
      };

      this.rapportService.createRapport(createRequest, this.selectedFile || undefined).subscribe({
        next: () => {
          this.showMessage('Rapport créé avec succès');
          this.modalRef?.close();
          this.loadRapports();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erreur lors de la création:', error);
          this.showMessage('Erreur lors de la création du rapport', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.showMessage('Le fichier ne doit pas dépasser 10MB', 'error');
        return;
      }
      this.selectedFile = file;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  viewRapport(rapport: RapportHebdomadaireEtendu): void {
    this.selectedRapport = rapport;
    this.modalRef = this.modalService.open(this.rapportDetailsModal, { 
      size: 'lg',
      backdrop: false,
      windowClass: 'modal-no-backdrop'
    });
  }

  editFromModal(): void {
    if (this.selectedRapport) {
      this.modalService.dismissAll();
      this.editRapport(this.selectedRapport);
    }
  }

  submitRapport(rapport: RapportHebdomadaireEtendu): void {
    if (!rapport.id) return;
    
    // TODO: Sélectionner l'enseignant destinataire
    const enseignantId = 1; // Temporaire
    
    this.rapportService.submitRapport(rapport.id, {
      statut: StatutRapport.SOUMIS,
      enseignantId
    }).subscribe({
      next: () => {
        this.showMessage('Rapport soumis avec succès');
        this.loadRapports();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la soumission:', error);
        this.showMessage('Erreur lors de la soumission du rapport', 'error');
      }
    });
  }

  deleteRapport(rapport: RapportHebdomadaireEtendu): void {
    if (!rapport.id) return;
    
    this.showConfirmDialog(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.',
      () => {
        this.rapportService.deleteRapport(rapport.id!).subscribe({
          next: () => {
            this.showMessage('Rapport supprimé avec succès');
            this.loadRapports();
          },
          error: (error) => {
            console.error('❌ Erreur lors de la suppression:', error);
            this.showMessage('Erreur lors de la suppression du rapport', 'error');
          }
        });
      }
    );
  }

  private showConfirmDialog(title: string, message: string, onConfirm: () => void): void {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal-overlay';
    modal.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-header">
          <h5>${title}</h5>
        </div>
        <div class="confirm-body">
          <p>${message}</p>
        </div>
        <div class="confirm-footer">
          <button class="btn btn-secondary cancel-btn">Annuler</button>
          <button class="btn btn-danger confirm-btn">Confirmer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    const cancelBtn = modal.querySelector('.cancel-btn');
    const confirmBtn = modal.querySelector('.confirm-btn');

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => document.body.removeChild(modal), 300);
    };

    cancelBtn?.addEventListener('click', closeModal);
    confirmBtn?.addEventListener('click', () => {
      onConfirm();
      closeModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}
