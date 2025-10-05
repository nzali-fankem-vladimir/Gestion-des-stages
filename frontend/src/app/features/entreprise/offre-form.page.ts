import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OffreService, OffreDto } from '../../core/services/offre.service';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-offre-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6 space-y-6">
      <!-- En-tête -->
      <div class="bg-white rounded-lg border p-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              <span *ngIf="isEditing">Modifier l'offre</span>
              <span *ngIf="!isEditing">Nouvelle offre de stage</span>
            </h1>
            <p class="text-gray-600">
              <span *ngIf="isEditing">Modifiez les informations de votre offre</span>
              <span *ngIf="!isEditing">Créez une nouvelle offre de stage pour votre entreprise</span>
            </p>
          </div>
          <button 
            (click)="cancel()"
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Retour
          </button>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="bg-white rounded-lg border p-6">
        <form [formGroup]="offreForm" (ngSubmit)="submit()">
          <!-- Informations générales -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-4">Informations générales</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Titre du stage *</label>
                <input 
                  formControlName="titre"
                  type="text" 
                  class="w-full border rounded px-3 py-2"
                  placeholder="Ex: Développeur Web Full-Stack"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Domaine *</label>
                <select formControlName="domaine" class="w-full border rounded px-3 py-2">
                  <option value="">Sélectionner un domaine</option>
                  <option value="INFORMATIQUE">Informatique</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="FINANCE">Finance</option>
                  <option value="RH">Ressources Humaines</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="DESIGN">Design</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Durée (en mois) *</label>
                <input 
                  formControlName="duree"
                  type="number" 
                  min="1"
                  max="12"
                  class="w-full border rounded px-3 py-2"
                  placeholder="3"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Lieu du stage *</label>
                <input 
                  formControlName="lieu"
                  type="text" 
                  class="w-full border rounded px-3 py-2"
                  placeholder="Paris, Lyon, Télétravail..."
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
                <input 
                  formControlName="dateDebut"
                  type="date" 
                  class="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date de fin *</label>
                <input 
                  formControlName="dateFin"
                  type="date" 
                  class="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Rémunération (CFA/mois)</label>
                <input 
                  formControlName="remuneration"
                  type="number" 
                  min="0"
                  class="w-full border rounded px-3 py-2"
                  placeholder="150000"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de places</label>
                <input 
                  formControlName="nombrePlaces"
                  type="number" 
                  min="1"
                  class="w-full border rounded px-3 py-2"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          <!-- Description détaillée -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-4">Description du stage</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description générale *</label>
                <textarea 
                  formControlName="description"
                  rows="4" 
                  class="w-full border rounded px-3 py-2"
                  placeholder="Décrivez lesmissions principales du stagiaire, l'environnement de travail, les objectifs..."
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Compétences requises</label>
                <textarea 
                  formControlName="competencesRequises"
                  rows="3" 
                  class="w-full border rounded px-3 py-2"
                  placeholder="Listez les compétences techniques et soft skills requises..."
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Avantages proposés</label>
                <textarea 
                  formControlName="avantages"
                  rows="2" 
                  class="w-full border rounded px-3 py-2"
                  placeholder="Tickets restaurant, télétravail partiel, formation..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-4">Contact</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom du contact</label>
                <input 
                  formControlName="contactNom"
                  type="text" 
                  class="w-full border rounded px-3 py-2"
                  placeholder="Nom du responsable RH"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                <input 
                  formControlName="contactEmail"
                  type="email" 
                  class="w-full border rounded px-3 py-2"
                  placeholder="rh@entreprise.com"
                />
              </div>
            </div>
          </div>

          <!-- Fichier de l'offre -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-4">Document de l'offre (optionnel)</h2>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="mt-4">
                  <label class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-gray-900">
                      Télécharger un fichier PDF de l'offre
                    </span>
                    <input 
                      #fileInput
                      type="file" 
                      accept=".pdf"
                      (change)="onFileSelected($event)"
                      class="sr-only"
                    />
                    <span class="mt-1 block text-xs text-gray-500">
                      PDF uniquement, max 10MB
                    </span>
                  </label>
                </div>
                <div class="mt-4" *ngIf="selectedFileName">
                  <div class="flex items-center justify-center space-x-2">
                    <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-gray-900">{{ selectedFileName }}</span>
                    <button 
                      type="button"
                      (click)="removeFile()"
                      class="text-red-500 hover:text-red-700"
                    >
                      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t">
            <button 
              type="button" 
              (click)="cancel()"
              class="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button 
              type="button"
              (click)="saveDraft()"
              class="px-6 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
              [disabled]="isLoading"
            >
              Enregistrer en brouillon
            </button>
            <button 
              type="submit"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              [disabled]="!offreForm.valid || isLoading"
            >
              <span *ngIf="isLoading">Enregistrement...</span>
              <span *ngIf="!isLoading && isEditing">Mettre à jour</span>
              <span *ngIf="!isLoading && !isEditing">Publier l'offre</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class OffreFormPageComponent implements OnInit {
  offreForm: FormGroup;
  isEditing = false;
  isLoading = false;
  offreId: number | null = null;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private service: OffreService, 
    private toast: ToastService, 
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {
    this.offreForm = this.fb.group({
      titre: ['', Validators.required],
      domaine: ['', Validators.required],
      duree: ['', [Validators.required, Validators.min(1)]],
      lieu: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      remuneration: [0],
      nombrePlaces: [1, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      competencesRequises: [''],
      avantages: [''],
      contactNom: [''],
      contactEmail: ['', Validators.email]
    });
  }

  ngOnInit(): void {
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.offreId = +params['id'];
        this.isEditing = true;
        this.loadOffre();
      }
    });
  }

  loadOffre() {
    if (!this.offreId) return;

    this.service.findById(this.offreId).subscribe({
      next: (offre: OffreDto) => {
        // Mapper les champs du backend vers le formulaire
        this.offreForm.patchValue({
          titre: offre.titre,
          domaine: offre.domaine,
          duree: offre.duree,
          lieu: offre.lieu,
          dateDebut: offre.dateDebut,
          dateFin: offre.dateFin,
          remuneration: offre.remuneration,
          nombrePlaces: offre.nombrePlaces,
          description: offre.description,
          competencesRequises: offre.competences, // Mapping inverse
          avantages: offre.avantages,
          contactNom: offre.contactNom,
          contactEmail: offre.contactEmail
        });
      },
      error: (err: any) => {
        console.error('Erreur chargement offre:', err);
        this.toast.show('Erreur lors du chargement de l\'offre', 'error');
        this.router.navigateByUrl('/offres');
      }
    });
  }

  submit() {
    if (!this.offreForm.valid) {
      this.toast.show('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      this.toast.show('Utilisateur non connecté', 'error');
      return;
    }

    this.isLoading = true;
    const formValue = this.offreForm.value;
    const formData = {
      titre: formValue.titre,
      description: formValue.description,
      duree: parseInt(formValue.duree),
      lieu: formValue.lieu,
      domaine: formValue.domaine,
      competences: formValue.competencesRequises, // Mapping correct vers le backend
      avantages: formValue.avantages,
      dateDebut: formValue.dateDebut,
      dateFin: formValue.dateFin,
      remuneration: formValue.remuneration ? parseFloat(formValue.remuneration) : 0,
      nombrePlaces: parseInt(formValue.nombrePlaces) || 1,
      contactNom: formValue.contactNom,
      contactEmail: formValue.contactEmail,
      entrepriseId: user.id,
      estActive: true
    };

    console.log('=== FORM DATA BEING SENT ===');
    console.log('Form Value:', formValue);
    console.log('Mapped Data:', formData);

    const operation = this.isEditing 
      ? this.service.update(this.offreId!, formData, this.selectedFile || undefined)
      : this.service.create(formData, this.selectedFile || undefined);

    operation.subscribe({
      next: () => {
        this.toast.show(
          this.isEditing ? 'Offre mise à jour avec succès' : 'Offre créée avec succès', 
          'success'
        );
        this.router.navigateByUrl('/offres');
      },
      error: (err) => {
        console.error('Erreur sauvegarde offre:', err);
        this.toast.show('Erreur lors de la sauvegarde', 'error');
        this.isLoading = false;
      }
    });
  }

  saveDraft() {
    const user = this.auth.currentUser;
    if (!user) {
      this.toast.show('Utilisateur non connecté', 'error');
      return;
    }

    this.isLoading = true;
    const formValue = this.offreForm.value;
    const formData = {
      titre: formValue.titre,
      description: formValue.description,
      duree: parseInt(formValue.duree),
      lieu: formValue.lieu,
      domaine: formValue.domaine,
      competences: formValue.competencesRequises, // Mapping correct vers le backend
      avantages: formValue.avantages,
      dateDebut: formValue.dateDebut,
      dateFin: formValue.dateFin,
      remuneration: formValue.remuneration ? parseFloat(formValue.remuneration) : 0,
      nombrePlaces: parseInt(formValue.nombrePlaces) || 1,
      contactNom: formValue.contactNom,
      contactEmail: formValue.contactEmail,
      entrepriseId: user.id,
      estActive: false
    };

    const operation = this.isEditing 
      ? this.service.update(this.offreId!, formData, this.selectedFile || undefined)
      : this.service.create(formData, this.selectedFile || undefined);

    operation.subscribe({
      next: () => {
        this.toast.show('Brouillon enregistré', 'success');
        this.router.navigateByUrl('/offres');
      },
      error: (err) => {
        console.error('Erreur sauvegarde brouillon:', err);
        this.toast.show('Erreur lors de la sauvegarde', 'error');
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validation du fichier
    if (file.type !== 'application/pdf') {
      this.toast.show('Veuillez sélectionner un fichier PDF', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB max
      this.toast.show('Le fichier ne doit pas dépasser 10MB', 'error');
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  removeFile() {
    this.selectedFile = null;
    this.selectedFileName = null;
  }

  cancel() { 
    this.router.navigateByUrl('/offres'); 
  }
}
