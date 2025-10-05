import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RapportService, RapportHebdomadaireDto } from '../../core/services/rapport.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rapports-enhanced',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styles: [`
    :host ::ng-deep .rapport-modal-no-backdrop .modal-backdrop { display: none !important; }
    :host ::ng-deep .rapport-modal-no-backdrop .modal-dialog {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border-radius: 0.75rem;
      border: 2px solid #e5e7eb;
    }
    .upload-zone { border: 2px dashed #d1d5db; transition: all 0.2s ease; }
    .upload-zone:hover { border-color: #6366f1; background-color: #f8fafc; }
    .upload-zone.dragover { border-color: #6366f1; background-color: #eef2ff; }
  `],
  template: `
    <div class="space-y-6">
      <!-- En-tête -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Mes rapports hebdomadaires</h1>
        <div class="flex space-x-3">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" (click)="openCreateModal()">
            Rédiger un rapport
          </button>
          <button class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" (click)="openUploadModal()">
            Uploader un fichier
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white border rounded-lg p-4">
        <div class="flex gap-4">
          <input type="text" placeholder="Rechercher..." class="border rounded px-3 py-2 flex-1" 
                 [(ngModel)]="searchQuery" (input)="filterRapports()"/>
          <select class="border rounded px-3 py-2" [(ngModel)]="statusFilter" (change)="filterRapports()">
            <option value="">Tous les statuts</option>
            <option value="BROUILLON">Brouillons</option>
            <option value="SOUMIS">Soumis</option>
            <option value="VALIDE">Validés</option>
          </select>
        </div>
      </div>

      <!-- Table des rapports -->
      <div class="bg-white border rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-4">Semaine</th>
              <th class="text-left p-4">Titre</th>
              <th class="text-left p-4">Statut</th>
              <th class="text-left p-4">Date</th>
              <th class="text-left p-4">Actions</th>
            </tr>
          </thead>
            <tbody>
              <tr *ngFor="let rapport of filteredRapports" class="border-b hover:bg-gray-50">
                <td class="p-4">Semaine {{ rapport.semaineNumero || rapport.semaine || '-' }}</td>
                <td class="p-4">{{ rapport.activitesRealisees || rapport.titre || 'Sans titre' }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 text-xs rounded-full" [ngClass]="getStatusClass(rapport.statut)">
                    {{ getStatusLabel(rapport.statut) }}
                  </span>
                </td>
                <td class="p-4">{{ formatDate(rapport.createdAt) }}</td>
                <td class="p-4">
                  <div class="flex space-x-2">
                    <button class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors" (click)="viewRapport(rapport)">Voir</button>
                    <button *ngIf="rapport.statut === 'BROUILLON'" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors" (click)="editRapport(rapport)">Modifier</button>
                    <button *ngIf="rapport.statut === 'BROUILLON'" class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors" (click)="submitRapport(rapport)">Soumettre</button>
                  </div>
                </td>
              </tr>
            </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de rédaction -->
    <ng-template #rapportModal let-modal>
      <div class="modal-header bg-blue-600 text-white p-4">
        <h4 class="text-lg font-semibold">{{ isEditing ? 'Modifier' : 'Nouveau' }} rapport</h4>
        <button type="button" class="text-white" (click)="closeModal(modal)">×</button>
      </div>
      <div class="modal-body p-6">
        <form [formGroup]="rapportForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Semaine</label>
              <input type="number" formControlName="semaine" class="w-full border rounded px-3 py-2"/>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Titre</label>
              <input type="text" formControlName="titre" class="w-full border rounded px-3 py-2"/>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Contenu</label>
            <textarea formControlName="contenu" rows="8" class="w-full border rounded px-3 py-2"></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer bg-gray-50 p-4 flex justify-between">
        <button class="px-4 py-2 border rounded" (click)="closeModal(modal)">Annuler</button>
        <div class="space-x-2">
          <button class="px-4 py-2 border rounded" (click)="saveDraft(modal)">Brouillon</button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" (click)="submitNewRapport(modal)">Soumettre</button>
        </div>
      </div>
    </ng-template>

    <!-- Modal d'upload -->
    <ng-template #uploadModal let-modal>
      <div class="modal-header bg-green-600 text-white p-4">
        <h4 class="text-lg font-semibold">Uploader un rapport</h4>
        <button type="button" class="text-white" (click)="closeModal(modal)">×</button>
      </div>
      <div class="modal-body p-6">
        <form [formGroup]="uploadForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Semaine</label>
              <input type="number" formControlName="semaine" class="w-full border rounded px-3 py-2"/>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Titre</label>
              <input type="text" formControlName="titre" class="w-full border rounded px-3 py-2"/>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Fichier</label>
            <div class="upload-zone p-8 text-center cursor-pointer rounded" 
                 (click)="triggerFileUpload()" (drop)="onDrop($event)" (dragover)="onDragOver($event)">
              <p>{{ selectedFile ? selectedFile.name : 'Cliquez ou glissez un fichier' }}</p>
              <p class="text-sm text-gray-500">PDF, DOC, DOCX - Max 10MB</p>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer bg-gray-50 p-4 flex justify-between">
        <button class="px-4 py-2 border rounded" (click)="closeModal(modal)">Annuler</button>
        <button class="px-4 py-2 bg-green-600 text-white rounded" (click)="uploadRapport(modal)">Uploader</button>
      </div>
    </ng-template>

    <input #fileInput type="file" accept=".pdf,.doc,.docx" (change)="onFileSelected($event)" class="hidden"/>

    <!-- Modal de soumission -->
    <ng-template #submitModal let-modal>
      <div class="modal-header bg-indigo-600 text-white p-4 flex justify-between items-center">
        <h4 class="text-lg font-semibold">Soumettre le rapport</h4>
        <button type="button" class="text-white text-xl" (click)="closeModal(modal)">×</button>
      </div>
      <div class="modal-body p-6" *ngIf="rapportToSubmit">
        <div class="space-y-4">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <h3 class="text-sm font-medium text-yellow-800">Attention</h3>
                <p class="text-sm text-yellow-700 mt-1">Une fois soumis, vous ne pourrez plus modifier ce rapport.</p>
              </div>
            </div>
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-900 mb-2">Rapport à soumettre :</h5>
            <p class="text-gray-700">{{ rapportToSubmit.activitesRealisees || rapportToSubmit.titre || 'Semaine ' + rapportToSubmit.semaineNumero }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut de soumission</label>
            <select [(ngModel)]="submissionStatus" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="SOUMIS">Soumis pour validation</option>
              <option value="FINAL">Version finale</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Enseignant destinataire</label>
            <select [(ngModel)]="selectedEnseignant" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Sélectionner un enseignant</option>
              <option *ngFor="let enseignant of enseignants" [value]="enseignant.id">
                {{ enseignant.prenom }} {{ enseignant.nom }} - {{ enseignant.departement }}
              </option>
            </select>
          </div>

          <div *ngIf="rapportToSubmit.stage?.entreprise || rapportToSubmit.entreprise">
            <label class="block text-sm font-medium text-gray-700 mb-1">Entreprise du stage</label>
            <p class="text-gray-900 bg-gray-50 p-2 rounded border">{{ rapportToSubmit.stage?.entreprise?.nom || rapportToSubmit.entreprise?.nom }}</p>
          </div>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 p-4 flex justify-end space-x-3">
        <button type="button" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" (click)="closeModal(modal)">
          Annuler
        </button>
        <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors" (click)="confirmSubmitRapport(modal)" [disabled]="!selectedEnseignant">
          Soumettre le rapport
        </button>
      </div>
    </ng-template>

    <!-- Modal de visualisation -->
    <ng-template #viewModal let-modal>
      <div class="modal-header bg-blue-600 text-white p-4 flex justify-between items-center">
        <h4 class="text-lg font-semibold">Détails du rapport</h4>
        <button type="button" class="text-white text-xl" (click)="closeModal(modal)">×</button>
      </div>
      <div class="modal-body p-6" *ngIf="selectedRapport">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Semaine</label>
              <p class="text-gray-900">{{ selectedRapport.semaineNumero || selectedRapport.semaine || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
              <p class="text-gray-900">{{ formatDate(selectedRapport.createdAt) }}</p>
            </div>
          </div>
          
          <div *ngIf="selectedRapport.dateDebutSemaine || selectedRapport.dateFinSemaine" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <p class="text-gray-900">{{ formatDate(selectedRapport.dateDebutSemaine) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <p class="text-gray-900">{{ formatDate(selectedRapport.dateFinSemaine) }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Activités réalisées</label>
            <div class="bg-gray-50 p-3 rounded border">
              <p class="text-gray-900 whitespace-pre-wrap">{{ selectedRapport.activitesRealisees || selectedRapport.contenu || 'Aucune activité renseignée' }}</p>
            </div>
          </div>

          <div *ngIf="selectedRapport.competencesAcquises">
            <label class="block text-sm font-medium text-gray-700 mb-1">Compétences acquises</label>
            <div class="bg-gray-50 p-3 rounded border">
              <p class="text-gray-900 whitespace-pre-wrap">{{ selectedRapport.competencesAcquises }}</p>
            </div>
          </div>

          <!-- Informations de soumission -->
          <div *ngIf="selectedRapport.statut !== 'BROUILLON'" class="border-t pt-4">
            <h6 class="text-sm font-medium text-gray-900 mb-3">Informations de soumission</h6>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <span class="px-2 py-1 text-xs rounded-full" [ngClass]="getStatusClass(selectedRapport.statut)">
                  {{ getStatusLabel(selectedRapport.statut) }}
                </span>
              </div>
              
              <div *ngIf="selectedRapport.dateSoumission">
                <label class="block text-sm font-medium text-gray-700 mb-1">Date de soumission</label>
                <p class="text-gray-900">{{ formatDate(selectedRapport.dateSoumission) }}</p>
              </div>
            </div>

            <div *ngIf="selectedRapport.enseignantDestinataire" class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Enseignant destinataire</label>
              <p class="text-gray-900">{{ selectedRapport.enseignantDestinataire.prenom }} {{ selectedRapport.enseignantDestinataire.nom }}</p>
            </div>

            <div *ngIf="selectedRapport.stage?.entreprise || selectedRapport.entreprise" class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Entreprise du stage</label>
              <p class="text-gray-900 bg-blue-50 p-2 rounded border">{{ selectedRapport.stage?.entreprise?.nom || selectedRapport.entreprise?.nom }}</p>
            </div>

            <div *ngIf="selectedRapport.commentairesEnseignant" class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Commentaires de l'enseignant</label>
              <div class="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p class="text-gray-900 whitespace-pre-wrap">{{ selectedRapport.commentairesEnseignant }}</p>
              </div>
            </div>
          </div>

          <div *ngIf="selectedRapport.difficultes">
            <label class="block text-sm font-medium text-gray-700 mb-1">Difficultés rencontrées</label>
            <div class="bg-gray-50 p-3 rounded border">
              <p class="text-gray-900 whitespace-pre-wrap">{{ selectedRapport.difficultes }}</p>
            </div>
          </div>

          <div *ngIf="selectedRapport.objectifsSemaineSuivante">
            <label class="block text-sm font-medium text-gray-700 mb-1">Objectifs semaine suivante</label>
            <div class="bg-gray-50 p-3 rounded border">
              <p class="text-gray-900 whitespace-pre-wrap">{{ selectedRapport.objectifsSemaineSuivante }}</p>
            </div>
          </div>

          <div *ngIf="selectedRapport.etudiant">
            <label class="block text-sm font-medium text-gray-700 mb-1">Étudiant</label>
            <p class="text-gray-900">{{ selectedRapport.etudiant.nom }} {{ selectedRapport.etudiant.prenom }}</p>
          </div>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 p-4 flex justify-end">
        <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" (click)="closeModal(modal)">
          Fermer
        </button>
      </div>
    </ng-template>
  `
})
export class RapportsEnhancedPageComponent implements OnInit {
  @ViewChild('rapportModal') rapportModal!: TemplateRef<any>;
  @ViewChild('uploadModal') uploadModal!: TemplateRef<any>;
  @ViewChild('viewModal') viewModal!: TemplateRef<any>;
  @ViewChild('submitModal') submitModal!: TemplateRef<any>;
  
  rapports: RapportHebdomadaireDto[] = [];
  filteredRapports: RapportHebdomadaireDto[] = [];
  rapportForm: FormGroup;
  uploadForm: FormGroup;
  
  searchQuery = '';
  statusFilter = '';
  isEditing = false;
  selectedFile: File | null = null;
  editingRapport: RapportHebdomadaireDto | null = null;
  selectedRapport: RapportHebdomadaireDto | null = null;
  
  // Nouvelles propriétés pour la soumission
  rapportToSubmit: RapportHebdomadaireDto | null = null;
  submissionStatus = 'SOUMIS';
  selectedEnseignant = '';
  enseignants: any[] = [];

  constructor(
    private service: RapportService,
    private auth: AuthService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toast: ToastService,
    private http: HttpClient
  ) {
    this.rapportForm = this.fb.group({
      semaine: ['', Validators.required],
      titre: ['', Validators.required],
      contenu: ['', Validators.required]
    });

    this.uploadForm = this.fb.group({
      semaine: ['', Validators.required],
      titre: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadRapports();
    this.loadEnseignants();
  }

  loadRapports() {
    const user = this.auth.currentUser;
    if (!user) return;
    
    this.service.getByEtudiant(user.id).subscribe({
      next: (rapports) => {
        this.rapports = rapports;
        this.filteredRapports = [...rapports];
      },
      error: (err) => {
        console.error('Erreur chargement rapports:', err);
        this.toast.show('Erreur lors du chargement', 'error');
      }
    });
  }

  filterRapports() {
    let filtered = [...this.rapports];
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.titre?.toLowerCase().includes(query) ||
        r.contenu?.toLowerCase().includes(query)
      );
    }
    
    if (this.statusFilter) {
      filtered = filtered.filter(r => r.statut === this.statusFilter);
    }
    
    this.filteredRapports = filtered;
  }

  openCreateModal() {
    console.log('=== OPEN CREATE MODAL DEBUG ===');
    console.log('Opening create modal...');
    this.isEditing = false;
    this.rapportForm.reset();
    console.log('Form reset, calling showRapportModal...');
    this.showRapportModal();
  }

  openUploadModal() {
    this.uploadForm.reset();
    this.selectedFile = null;
    this.showUploadModal();
  }

  editRapport(rapport: RapportHebdomadaireDto) {
    this.isEditing = true;
    this.editingRapport = rapport;
    this.rapportForm.patchValue(rapport);
    this.showRapportModal();
  }

  viewRapport(rapport: RapportHebdomadaireDto) {
    console.log('Viewing rapport:', rapport);
    this.selectedRapport = rapport;
    this.modalService.open(this.viewModal, { size: 'lg', backdrop: false });
  }

  saveDraft(modal: any) {
    const formData = this.rapportForm.value;
    formData.statut = 'BROUILLON';
    this.saveRapport(formData, modal);
  }

  submitNewRapport(modal: any) {
    console.log('=== SUBMIT NOUVEAU RAPPORT DEBUG ===');
    console.log('Form valid:', this.rapportForm.valid);
    console.log('Form value:', this.rapportForm.value);
    console.log('Current user:', this.auth.currentUser);
    
    const formData = this.rapportForm.value;
    formData.statut = 'SOUMIS';
    console.log('Data to submit:', formData);
    
    this.saveRapport(formData, modal);
  }

  private saveRapport(data: any, modal: any) {
    console.log('=== SAVE RAPPORT DEBUG ===');
    const user = this.auth.currentUser;
    console.log('User:', user);
    
    if (!user) {
      console.log('No user found, returning');
      return;
    }

    // Adapter les données pour correspondre au DTO backend
    const backendData = {
      etudiant: { id: user.id },
      stage: { id: data.offreId || 1 }, // TODO: récupérer le vrai ID d'offre
      semaineNumero: data.semaine,
      dateDebutSemaine: data.dateDebut,
      dateFinSemaine: data.dateFin,
      activitesRealisees: data.contenu,
      competencesAcquises: '', // TODO: ajouter ce champ au formulaire
      difficultes: '', // TODO: ajouter ce champ au formulaire
      objectifsSemaineSuivante: '' // TODO: ajouter ce champ au formulaire
    };
    
    console.log('Final backend data:', backendData);

    if (this.isEditing && this.editingRapport) {
      console.log('Updating existing rapport:', this.editingRapport.id);
      this.service.update(this.editingRapport.id!, backendData).subscribe({
        next: (response) => {
          console.log('Update success:', response);
          this.toast.show('Rapport mis à jour', 'success');
          this.loadRapports();
          this.closeModal(modal);
        },
        error: (err) => {
          console.error('Erreur mise à jour:', err);
          this.toast.show('Erreur lors de la mise à jour', 'error');
        }
      });
    } else {
      console.log('Creating new rapport');
      this.service.create(backendData).subscribe({
        next: (response) => {
          console.log('Create success:', response);
          this.toast.show('Rapport créé', 'success');
          this.loadRapports();
          this.closeModal(modal);
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.toast.show('Erreur lors de la création', 'error');
        }
      });
    }
  }

  uploadRapport(modal: any) {
    console.log('=== UPLOAD RAPPORT DEBUG ===');
    console.log('Upload form valid:', this.uploadForm.valid);
    console.log('Upload form value:', this.uploadForm.value);
    console.log('Selected file:', this.selectedFile);
    console.log('Current user:', this.auth.currentUser);
    
    if (!this.selectedFile) {
      console.log('No file selected');
      this.toast.show('Veuillez sélectionner un fichier', 'error');
      return;
    }

    if (!this.uploadForm.valid) {
      console.log('Form is invalid');
      this.toast.show('Veuillez remplir tous les champs', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('semaine', this.uploadForm.get('semaine')?.value);
    formData.append('titre', this.uploadForm.get('titre')?.value);
    formData.append('etudiantId', this.auth.currentUser?.id?.toString() || '');

    console.log('FormData contents:');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    this.service.uploadFile(formData).subscribe({
      next: (response) => {
        console.log('Upload success:', response);
        this.toast.show('Rapport uploadé avec succès', 'success');
        this.loadRapports();
        this.closeModal(modal);
      },
      error: (err) => {
        console.error('Erreur upload:', err);
        this.toast.show('Erreur lors de l\'upload', 'error');
      }
    });
  }

  triggerFileUpload() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.toast.show('Fichier trop volumineux (max 10MB)', 'error');
        return;
      }
      this.selectedFile = file;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  showRapportModal() {
    this.modalService.open(this.rapportModal, {
      size: 'lg',
      backdrop: false,
      windowClass: 'rapport-modal-no-backdrop'
    });
  }

  showUploadModal() {
    this.modalService.open(this.uploadModal, {
      size: 'md',
      backdrop: false,
      windowClass: 'rapport-modal-no-backdrop'
    });
  }

  closeModal(modal: any) {
    modal.dismiss();
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Non défini';
    const labels: { [key: string]: string } = {
      'BROUILLON': 'Brouillon',
      'SOUMIS': 'Soumis pour validation',
      'VALIDE': 'Validé par l\'enseignant',
      'REJETE': 'Rejeté par l\'enseignant',
      'A_MODIFIER': 'À modifier',
      'FINAL': 'Version finale'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    const classes: { [key: string]: string } = {
      'BROUILLON': 'bg-gray-100 text-gray-800',
      'SOUMIS': 'bg-blue-100 text-blue-800',
      'VALIDE': 'bg-green-100 text-green-800',
      'REJETE': 'bg-red-100 text-red-800',
      'A_MODIFIER': 'bg-yellow-100 text-yellow-800',
      'FINAL': 'bg-purple-100 text-purple-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  loadEnseignants() {
    this.http.get<any[]>(`${environment.apiUrl}/enseignants/all`).subscribe({
      next: (enseignants) => {
        this.enseignants = enseignants;
        console.log('Enseignants chargés:', enseignants.length, 'enseignants');
      },
      error: (err) => {
        console.error('Erreur chargement enseignants:', err);
      }
    });
  }

  submitRapport(rapport: RapportHebdomadaireDto) {
    this.rapportToSubmit = rapport;
    this.submissionStatus = 'SOUMIS';
    this.selectedEnseignant = '';
    this.modalService.open(this.submitModal, { size: 'lg', backdrop: false, windowClass: 'rapport-modal-no-backdrop' });
  }

  confirmSubmitRapport(modal: any) {
    if (!this.rapportToSubmit || !this.selectedEnseignant) {
      this.toast.show('Veuillez sélectionner un enseignant', 'error');
      return;
    }

    console.log('=== SOUMISSION RAPPORT ===');
    console.log('Rapport ID:', this.rapportToSubmit.id);
    console.log('Enseignant destinataire:', this.selectedEnseignant);
    console.log('Statut:', this.submissionStatus);
    
    const submissionData = {
      statut: this.submissionStatus,
      enseignantId: this.selectedEnseignant,
      dateSoumission: new Date().toISOString()
    };

    this.http.put(`${environment.apiUrl}/rapports-hebdomadaires/${this.rapportToSubmit.id}/submit`, submissionData).subscribe({
      next: (updatedRapport: any) => {
        console.log('✅ Rapport soumis avec succès:', updatedRapport);
        this.toast.show('Rapport soumis avec succès', 'success');
        this.loadRapports();
        this.closeModal(modal);
        
        // Envoyer notification à l'enseignant
        this.sendNotificationToEnseignant(this.selectedEnseignant, this.rapportToSubmit!);
        
        // Mettre à jour le rapport local avec les nouvelles données
        if (updatedRapport.dateSoumission) {
          console.log('Date de soumission reçue:', updatedRapport.dateSoumission);
        }
      },
      error: (err: any) => {
        console.error('❌ Erreur soumission rapport:', err);
        this.toast.show('Erreur lors de la soumission du rapport', 'error');
      }
    });
  }

  sendNotificationToEnseignant(enseignantId: string, rapport: RapportHebdomadaireDto) {
    const notificationData = {
      destinataireId: parseInt(enseignantId),
      type: 'INFO',
      titre: 'Nouveau rapport à valider',
      message: `Un nouveau rapport de stage a été soumis par ${this.auth.currentUser?.fullName} pour la semaine ${rapport.semaineNumero}`,
      lien: `/enseignant/rapports`
    };

    this.http.post(`${environment.apiUrl}/notifications`, notificationData).subscribe({
      next: () => {
        console.log('✅ Notification envoyée à l\'enseignant');
      },
      error: (err) => {
        console.error('❌ Erreur envoi notification:', err);
      }
    });
  }
}
