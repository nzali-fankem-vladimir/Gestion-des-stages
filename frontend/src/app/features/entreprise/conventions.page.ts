import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ConventionDto {
  id?: number;
  etudiant?: { id: number; nom: string; prenom: string; email: string; };
  entreprise?: { id: number; nom: string; };
  offre?: { id: number; titre: string; };
  dateDebut?: string;
  dateFin?: string;
  dureeHeures?: number;
  gratification?: number;
  objectifs?: string;
  missions?: string;
  competencesVisees?: string;
  modalitesEvaluation?: string;
  statut?: 'BROUILLON' | 'SOUMISE' | 'VALIDEE' | 'REJETEE' | 'SIGNEE';
  commentaires?: string;
  dateCreation?: string;
  dateValidation?: string;
  fichierUrl?: string;
}

@Component({
  selector: 'app-conventions-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto p-6 space-y-6">
      <!-- En-tête -->
      <div class="bg-white rounded-lg border p-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Conventions de stage</h1>
            <p class="text-gray-600">Gérez les conventions de stage de votre entreprise</p>
          </div>
          <button 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            (click)="openCreateModal()"
          >
            ➕ Nouvelle convention
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-gray-600">{{ stats.brouillons }}</div>
          <div class="text-sm text-gray-600">Brouillons</div>
        </div>
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.soumises }}</div>
          <div class="text-sm text-gray-600">Soumises</div>
        </div>
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.validees }}</div>
          <div class="text-sm text-gray-600">Validées</div>
        </div>
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ stats.rejetees }}</div>
          <div class="text-sm text-gray-600">Rejetées</div>
        </div>
        <div class="bg-white rounded-lg border p-4 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ stats.signees }}</div>
          <div class="text-sm text-gray-600">Signées</div>
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
              placeholder="Rechercher par étudiant, offre..."
            />
          </div>
          <div>
            <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="border rounded px-3 py-2 text-sm">
              <option value="">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="SOUMISE">Soumise</option>
              <option value="VALIDEE">Validée</option>
              <option value="REJETEE">Rejetée</option>
              <option value="SIGNEE">Signée</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tableau des conventions -->
      <div class="bg-white rounded-lg border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-4">Étudiant</th>
              <th class="text-left p-4">Offre</th>
              <th class="text-left p-4">Période</th>
              <th class="text-left p-4">Gratification</th>
              <th class="text-left p-4">Statut</th>
              <th class="text-left p-4">Date création</th>
              <th class="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let convention of filteredConventions" class="border-b hover:bg-gray-50">
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-blue-600">
                      {{ getInitials(convention.etudiant?.nom, convention.etudiant?.prenom) }}
                    </span>
                  </div>
                  <div>
                    <div class="font-medium">{{ convention.etudiant?.nom }} {{ convention.etudiant?.prenom }}</div>
                    <div class="text-gray-500 text-xs">{{ convention.etudiant?.email }}</div>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="font-medium">{{ convention.offre?.titre }}</div>
              </td>
              <td class="p-4">
                <div>{{ formatDate(convention.dateDebut) }}</div>
                <div class="text-gray-500 text-xs">au {{ formatDate(convention.dateFin) }}</div>
              </td>
              <td class="p-4">
                <div class="font-medium">{{ convention.gratification || 0 }}€/mois</div>
                <div class="text-gray-500 text-xs">{{ convention.dureeHeures }}h</div>
              </td>
              <td class="p-4">
                <span class="px-2 py-1 text-xs rounded-full" [ngClass]="getStatusClass(convention.statut)">
                  {{ getStatusLabel(convention.statut) }}
                </span>
              </td>
              <td class="p-4">{{ formatDate(convention.dateCreation) }}</td>
              <td class="p-4">
                <div class="flex justify-end space-x-2">
                  <button 
                    class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    (click)="viewConvention(convention)"
                  >
                    Voir
                  </button>
                  <button 
                    *ngIf="convention.statut === 'BROUILLON'"
                    class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                    (click)="editConvention(convention)"
                  >
                    Modifier
                  </button>
                  <button 
                    *ngIf="convention.statut === 'BROUILLON'"
                    class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                    (click)="submitConvention(convention)"
                  >
                    Soumettre
                  </button>
                  <button 
                    *ngIf="convention.fichierUrl"
                    class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    (click)="downloadConvention(convention)"
                  >
                    📄 PDF
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div *ngIf="filteredConventions.length === 0" class="text-center py-8 text-gray-500">
          Aucune convention trouvée
        </div>
      </div>
    </div>

    <!-- Modal de création/modification -->
    <ng-template #conventionModal let-modal>
      <div class="modal-header bg-blue-600 text-white p-4 flex justify-between items-center">
        <h4 class="text-lg font-semibold">{{ isEditing ? 'Modifier la convention' : 'Nouvelle convention' }}</h4>
        <button type="button" class="text-white text-xl" (click)="closeModal(modal)">×</button>
      </div>
      <div class="modal-body p-6" style="max-height: 70vh; overflow-y: auto;">
        <form [formGroup]="conventionForm">
          <div class="space-y-6">
            <!-- Informations générales -->
            <div>
              <h5 class="font-semibold mb-3">Informations générales</h5>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Étudiant *</label>
                  <select formControlName="etudiantId" class="w-full border rounded px-3 py-2">
                    <option value="">Sélectionner un étudiant</option>
                    <option *ngFor="let etudiant of etudiants" [value]="etudiant.id">
                      {{ etudiant.nom }} {{ etudiant.prenom }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Offre *</label>
                  <select formControlName="offreId" class="w-full border rounded px-3 py-2">
                    <option value="">Sélectionner une offre</option>
                    <option *ngFor="let offre of offres" [value]="offre.id">
                      {{ offre.titre }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
                  <input formControlName="dateDebut" type="date" class="w-full border rounded px-3 py-2">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Date de fin *</label>
                  <input formControlName="dateFin" type="date" class="w-full border rounded px-3 py-2">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Durée (heures/semaine) *</label>
                  <input formControlName="dureeHeures" type="number" min="1" max="35" class="w-full border rounded px-3 py-2">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Gratification (€/mois)</label>
                  <input formControlName="gratification" type="number" min="0" class="w-full border rounded px-3 py-2">
                </div>
              </div>
            </div>

            <!-- Contenu pédagogique -->
            <div>
              <h5 class="font-semibold mb-3">Contenu pédagogique</h5>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Objectifs du stage *</label>
                  <textarea formControlName="objectifs" rows="3" class="w-full border rounded px-3 py-2"
                    placeholder="Décrivez les objectifs pédagogiques du stage..."></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Missions confiées *</label>
                  <textarea formControlName="missions" rows="4" class="w-full border rounded px-3 py-2"
                    placeholder="Détaillez les missions qui seront confiées au stagiaire..."></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Compétences visées</label>
                  <textarea formControlName="competencesVisees" rows="3" class="w-full border rounded px-3 py-2"
                    placeholder="Listez les compétences que le stagiaire développera..."></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Modalités d'évaluation</label>
                  <textarea formControlName="modalitesEvaluation" rows="3" class="w-full border rounded px-3 py-2"
                    placeholder="Décrivez comment le stagiaire sera évalué..."></textarea>
                </div>
              </div>
            </div>

            <!-- Commentaires -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Commentaires</label>
              <textarea formControlName="commentaires" rows="2" class="w-full border rounded px-3 py-2"
                placeholder="Commentaires additionnels..."></textarea>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer bg-gray-50 p-4 flex justify-end space-x-3">
        <button class="px-4 py-2 border rounded hover:bg-gray-50" (click)="closeModal(modal)">
          Annuler
        </button>
        <button 
          class="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
          (click)="saveConvention(modal, 'BROUILLON')"
          [disabled]="isLoading"
        >
          Enregistrer en brouillon
        </button>
        <button 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          (click)="saveConvention(modal, 'SOUMISE')"
          [disabled]="!conventionForm.valid || isLoading"
        >
          {{ isLoading ? 'Enregistrement...' : 'Soumettre pour validation' }}
        </button>
      </div>
    </ng-template>

    <!-- Modal de visualisation -->
    <ng-template #viewModal let-modal>
      <div class="modal-header bg-blue-600 text-white p-4 flex justify-between items-center">
        <h4 class="text-lg font-semibold">Détails de la convention</h4>
        <button type="button" class="text-white text-xl" (click)="closeModal(modal)">×</button>
      </div>
      <div class="modal-body p-6" style="max-height: 70vh; overflow-y: auto;" *ngIf="selectedConvention">
        <div class="space-y-6">
          <!-- Informations générales -->
          <div>
            <h5 class="font-semibold mb-3">Informations générales</h5>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Étudiant :</span>
                <span class="ml-2 font-medium">{{ selectedConvention.etudiant?.nom }} {{ selectedConvention.etudiant?.prenom }}</span>
              </div>
              <div>
                <span class="text-gray-600">Offre :</span>
                <span class="ml-2">{{ selectedConvention.offre?.titre }}</span>
              </div>
              <div>
                <span class="text-gray-600">Période :</span>
                <span class="ml-2">{{ formatDate(selectedConvention.dateDebut) }} au {{ formatDate(selectedConvention.dateFin) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Durée :</span>
                <span class="ml-2">{{ selectedConvention.dureeHeures }}h/semaine</span>
              </div>
              <div>
                <span class="text-gray-600">Gratification :</span>
                <span class="ml-2">{{ selectedConvention.gratification || 0 }}€/mois</span>
              </div>
              <div>
                <span class="text-gray-600">Statut :</span>
                <span class="ml-2 px-2 py-1 text-xs rounded-full" [ngClass]="getStatusClass(selectedConvention.statut)">
                  {{ getStatusLabel(selectedConvention.statut) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Contenu détaillé -->
          <div *ngIf="selectedConvention.objectifs">
            <h5 class="font-semibold mb-2">Objectifs du stage</h5>
            <div class="bg-gray-50 p-3 rounded text-sm">{{ selectedConvention.objectifs }}</div>
          </div>

          <div *ngIf="selectedConvention.missions">
            <h5 class="font-semibold mb-2">Missions confiées</h5>
            <div class="bg-gray-50 p-3 rounded text-sm">{{ selectedConvention.missions }}</div>
          </div>

          <div *ngIf="selectedConvention.competencesVisees">
            <h5 class="font-semibold mb-2">Compétences visées</h5>
            <div class="bg-gray-50 p-3 rounded text-sm">{{ selectedConvention.competencesVisees }}</div>
          </div>

          <div *ngIf="selectedConvention.modalitesEvaluation">
            <h5 class="font-semibold mb-2">Modalités d'évaluation</h5>
            <div class="bg-gray-50 p-3 rounded text-sm">{{ selectedConvention.modalitesEvaluation }}</div>
          </div>

          <div *ngIf="selectedConvention.commentaires">
            <h5 class="font-semibold mb-2">Commentaires</h5>
            <div class="bg-gray-50 p-3 rounded text-sm">{{ selectedConvention.commentaires }}</div>
          </div>
        </div>
      </div>
      <div class="modal-footer bg-gray-50 p-4 flex justify-end space-x-3">
        <button 
          *ngIf="selectedConvention?.fichierUrl"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          (click)="selectedConvention && downloadConvention(selectedConvention)"
        >
          📄 Télécharger PDF
        </button>
        <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" (click)="closeModal(modal)">
          Fermer
        </button>
      </div>
    </ng-template>
  `
})
export class ConventionsPageComponent implements OnInit {
  @ViewChild('conventionModal') conventionModal!: TemplateRef<any>;
  @ViewChild('viewModal') viewModal!: TemplateRef<any>;

  conventions: ConventionDto[] = [];
  filteredConventions: ConventionDto[] = [];
  etudiants: any[] = [];
  offres: any[] = [];
  selectedConvention: ConventionDto | null = null;
  
  conventionForm: FormGroup;
  isEditing = false;
  isLoading = false;
  editingConvention: ConventionDto | null = null;
  
  searchQuery = '';
  statusFilter = '';
  
  stats = {
    brouillons: 0,
    soumises: 0,
    validees: 0,
    rejetees: 0,
    signees: 0
  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private modalService: NgbModal,
    private http: HttpClient
  ) {
    this.conventionForm = this.fb.group({
      etudiantId: ['', Validators.required],
      offreId: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      dureeHeures: ['', [Validators.required, Validators.min(1), Validators.max(35)]],
      gratification: [0],
      objectifs: ['', Validators.required],
      missions: ['', Validators.required],
      competencesVisees: [''],
      modalitesEvaluation: [''],
      commentaires: ['']
    });
  }

  ngOnInit(): void {
    this.loadConventions();
    this.loadEtudiants();
    this.loadOffres();
  }

  loadConventions() {
    const user = this.auth.currentUser;
    if (!user) return;

    this.http.get<ConventionDto[]>(`${environment.apiUrl}/conventions/entreprise/${user.id}`).subscribe({
      next: (conventions) => {
        this.conventions = conventions;
        this.applyFilters();
        this.calculateStats();
      },
      error: (err) => {
        console.error('Erreur chargement conventions:', err);
        this.toast.show('Erreur lors du chargement des conventions', 'error');
      }
    });
  }

  loadEtudiants() {
    // Charger les étudiants qui ont candidaté aux offres de l'entreprise
    const user = this.auth.currentUser;
    if (!user) return;

    this.http.get<any[]>(`${environment.apiUrl}/candidatures/entreprise/${user.id}/etudiants`).subscribe({
      next: (etudiants) => {
        this.etudiants = etudiants;
      },
      error: (err) => {
        console.error('Erreur chargement étudiants:', err);
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
    let filtered = [...this.conventions];
    
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
    
    this.filteredConventions = filtered;
  }

  calculateStats() {
    this.stats = {
      brouillons: this.conventions.filter(c => c.statut === 'BROUILLON').length,
      soumises: this.conventions.filter(c => c.statut === 'SOUMISE').length,
      validees: this.conventions.filter(c => c.statut === 'VALIDEE').length,
      rejetees: this.conventions.filter(c => c.statut === 'REJETEE').length,
      signees: this.conventions.filter(c => c.statut === 'SIGNEE').length
    };
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingConvention = null;
    this.conventionForm.reset();
    this.modalService.open(this.conventionModal, { size: 'xl', backdrop: false });
  }

  editConvention(convention: ConventionDto) {
    this.isEditing = true;
    this.editingConvention = convention;
    this.conventionForm.patchValue({
      etudiantId: convention.etudiant?.id,
      offreId: convention.offre?.id,
      dateDebut: convention.dateDebut,
      dateFin: convention.dateFin,
      dureeHeures: convention.dureeHeures,
      gratification: convention.gratification,
      objectifs: convention.objectifs,
      missions: convention.missions,
      competencesVisees: convention.competencesVisees,
      modalitesEvaluation: convention.modalitesEvaluation,
      commentaires: convention.commentaires
    });
    this.modalService.open(this.conventionModal, { size: 'xl', backdrop: false });
  }

  viewConvention(convention: ConventionDto) {
    this.selectedConvention = convention;
    this.modalService.open(this.viewModal, { size: 'lg', backdrop: false });
  }

  saveConvention(modal: any, statut: string) {
    if (statut === 'SOUMISE' && !this.conventionForm.valid) {
      this.toast.show('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) return;

    this.isLoading = true;
    const formData = {
      ...this.conventionForm.value,
      entrepriseId: user.id,
      statut: statut
    };

    const operation = this.isEditing && this.editingConvention
      ? this.http.put(`${environment.apiUrl}/conventions/${this.editingConvention.id}`, formData)
      : this.http.post(`${environment.apiUrl}/conventions`, formData);

    operation.subscribe({
      next: () => {
        this.toast.show(
          this.isEditing ? 'Convention mise à jour' : 'Convention créée',
          'success'
        );
        this.loadConventions();
        this.closeModal(modal);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur sauvegarde convention:', err);
        this.toast.show('Erreur lors de la sauvegarde', 'error');
        this.isLoading = false;
      }
    });
  }

  submitConvention(convention: ConventionDto) {
    if (!convention.id) return;

    this.http.put(`${environment.apiUrl}/conventions/${convention.id}`, { statut: 'SOUMISE' }).subscribe({
      next: () => {
        convention.statut = 'SOUMISE';
        this.toast.show('Convention soumise pour validation', 'success');
        this.calculateStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur soumission:', err);
        this.toast.show('Erreur lors de la soumission', 'error');
      }
    });
  }

  downloadConvention(convention: ConventionDto) {
    if (convention.fichierUrl) {
      window.open(convention.fichierUrl, '_blank');
    } else {
      this.toast.show('Aucun fichier disponible', 'info');
    }
  }

  getInitials(nom?: string, prenom?: string): string {
    const n = nom?.charAt(0)?.toUpperCase() || '';
    const p = prenom?.charAt(0)?.toUpperCase() || '';
    return n + p;
  }

  getStatusClass(statut?: string): string {
    switch (statut) {
      case 'BROUILLON': return 'bg-gray-100 text-gray-800';
      case 'SOUMISE': return 'bg-blue-100 text-blue-800';
      case 'VALIDEE': return 'bg-green-100 text-green-800';
      case 'REJETEE': return 'bg-red-100 text-red-800';
      case 'SIGNEE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(statut?: string): string {
    switch (statut) {
      case 'BROUILLON': return 'Brouillon';
      case 'SOUMISE': return 'Soumise';
      case 'VALIDEE': return 'Validée';
      case 'REJETEE': return 'Rejetée';
      case 'SIGNEE': return 'Signée';
      default: return 'Inconnu';
    }
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  closeModal(modal: any) {
    modal.dismiss();
    this.isLoading = false;
  }
}
