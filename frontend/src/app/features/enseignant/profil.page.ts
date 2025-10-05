import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ProfileImageService } from '../../core/services/profile-image.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-enseignant-profil-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p class="text-gray-600">Gérez vos informations personnelles</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Photo de profil -->
        <div class="lg:col-span-1">
          <div class="bg-white border rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Photo de profil</h3>
            
            <div class="flex flex-col items-center space-y-4">
              <div class="relative">
                <div class="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <img *ngIf="profileImageUrl" [src]="profileImageUrl" alt="Photo de profil" class="w-full h-full object-cover">
                  <svg *ngIf="!profileImageUrl" class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <button 
                  (click)="triggerPhotoUpload()"
                  class="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                (change)="onPhotoSelected($event)"
                class="hidden"
              />
              
              <p class="text-sm text-gray-500 text-center">
                JPG, PNG ou GIF<br>
                Maximum 5MB
              </p>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="bg-white border rounded-lg p-6 mt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Conventions validées</span>
                <span class="text-sm font-medium text-green-600">{{ stats.conventionsValidees }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Conventions en attente</span>
                <span class="text-sm font-medium text-yellow-600">{{ stats.conventionsEnAttente }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Rapports validés</span>
                <span class="text-sm font-medium text-green-600">{{ stats.rapportsValides }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Rapports en attente</span>
                <span class="text-sm font-medium text-yellow-600">{{ stats.rapportsEnAttente }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <div class="lg:col-span-2">
          <div class="bg-white border rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Informations personnelles</h3>
            
            <form [formGroup]="profileForm" (ngSubmit)="onSubmitProfile()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="prenom" class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input 
                    type="text" 
                    id="prenom"
                    formControlName="prenom"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label for="nom" class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input 
                    type="text" 
                    id="nom"
                    formControlName="nom"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div class="md:col-span-2">
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    formControlName="email"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label for="telephone" class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input 
                    type="tel" 
                    id="telephone"
                    formControlName="telephone"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label for="departement" class="block text-sm font-medium text-gray-700 mb-2">Département</label>
                  <input 
                    type="text" 
                    id="departement"
                    formControlName="departement"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div class="md:col-span-2">
                  <label for="specialite" class="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                  <input 
                    type="text" 
                    id="specialite"
                    formControlName="specialite"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div class="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  [disabled]="isSubmitting || profileForm.invalid"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ isSubmitting ? 'Mise à jour...' : 'Mettre à jour' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EnseignantProfilPageComponent implements OnInit {
  profileForm: FormGroup;
  profileImageUrl = '';
  isSubmitting = false;
  stats = {
    conventionsValidees: 0,
    conventionsEnAttente: 0,
    rapportsValides: 0,
    rapportsEnAttente: 0
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private auth: AuthService,
    private profileImageService: ProfileImageService,
    private toast: ToastService
  ) {
    this.profileForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      departement: [''],
      specialite: ['']
    });
  }

  ngOnInit() {
    this.loadProfile();
    this.loadStatistics();
    this.loadProfileImage();
  }

  get currentUser() {
    return this.auth.currentUser;
  }

  loadProfile() {
    if (!this.currentUser?.id) return;

    this.http.get(`${environment.apiUrl}/enseignants/${this.currentUser.id}`).subscribe({
      next: (enseignant: any) => {
        console.log('Données enseignant chargées:', enseignant);
        this.profileForm.patchValue({
          prenom: enseignant.prenom || '',
          nom: enseignant.nom || '',
          email: enseignant.email || '',
          telephone: enseignant.telephone || '',
          departement: enseignant.departement || '',
          specialite: enseignant.specialite || ''
        });
      },
      error: (err) => {
        console.error('Erreur chargement profil enseignant:', err);
      }
    });
  }

  loadProfileImage() {
    this.profileImageService.loadProfileImage().subscribe({
      next: (imageUrl) => {
        if (imageUrl) {
          this.profileImageUrl = imageUrl;
        }
      },
      error: (err) => {
        console.log('Erreur chargement photo:', err);
      }
    });
  }

  loadStatistics() {
    if (!this.currentUser?.id) return;

    // Charger conventions
    this.http.get<any[]>(`${environment.apiUrl}/conventions/enseignant/all`).subscribe({
      next: (conventions) => {
        this.stats.conventionsValidees = conventions.filter(c => c.statut === 'VALIDEE').length;
        this.stats.conventionsEnAttente = conventions.filter(c => c.statut === 'SOUMISE').length;
      },
      error: (err) => {
        console.error('Erreur chargement conventions:', err);
      }
    });

    // Charger rapports
    this.http.get<any[]>(`${environment.apiUrl}/rapports-hebdomadaires/enseignant/all`).subscribe({
      next: (rapports) => {
        this.stats.rapportsValides = rapports.filter(r => r.statut === 'VALIDE').length;
        this.stats.rapportsEnAttente = rapports.filter(r => r.statut === 'SOUMIS').length;
      },
      error: (err) => {
        console.error('Erreur chargement rapports:', err);
      }
    });
  }

  onSubmitProfile() {
    if (this.profileForm.valid && this.currentUser?.id) {
      this.isSubmitting = true;
      const formData = this.profileForm.value;
      
      const apiFormData = new FormData();
      apiFormData.append('prenom', formData.prenom || '');
      apiFormData.append('nom', formData.nom || '');
      apiFormData.append('email', formData.email || '');
      apiFormData.append('telephone', formData.telephone || '');
      apiFormData.append('departement', formData.departement || '');
      apiFormData.append('specialite', formData.specialite || '');
      
      this.http.put(`${environment.apiUrl}/enseignants/${this.currentUser.id}`, apiFormData).subscribe({
        next: (response: any) => {
          console.log('✅ Profil enseignant mis à jour:', response);
          this.toast.show('Profil mis à jour avec succès', 'success');
          this.isSubmitting = false;
          
          // Mettre à jour les données locales
          if (this.currentUser) {
            this.currentUser.fullName = `${formData.prenom} ${formData.nom}`;
            this.auth.currentUser = this.currentUser;
          }
        },
        error: (err) => {
          console.error('❌ Erreur mise à jour profil enseignant:', err);
          this.toast.show('Erreur lors de la mise à jour du profil', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.toast.show('Veuillez remplir tous les champs requis', 'error');
    }
  }

  triggerPhotoUpload() {
    const photoInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    if (photoInput) {
      photoInput.click();
    }
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadPhoto(file);
    }
  }

  uploadPhoto(file: File) {
    console.log('Upload photo enseignant:', file.name, file.size, file.type);
    
    if (file.size > 5 * 1024 * 1024) {
      this.toast.show('La photo ne doit pas dépasser 5MB', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.toast.show('Seuls les fichiers image sont acceptés', 'error');
      return;
    }

    // Utiliser le ProfileImageService pour un upload cohérent
    this.profileImageService.uploadProfileImage(file).subscribe({
      next: (imageUrl) => {
        console.log('✅ Photo enseignant uploadée:', imageUrl);
        this.profileImageUrl = imageUrl;
        this.toast.show('Photo de profil mise à jour', 'success');
      },
      error: (err) => {
        console.error('❌ Erreur upload photo enseignant:', err);
        this.toast.show('Erreur lors de l\'upload de la photo', 'error');
      }
    });
  }
}
