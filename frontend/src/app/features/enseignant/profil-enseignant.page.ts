import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, CurrentUser } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProfileImageService } from '../../core/services/profile-image.service';

@Component({
  selector: 'app-enseignant-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">Mon Profil Enseignant</h1>
          <p class="text-gray-600 mt-1">Gérez vos informations personnelles</p>
        </div>

        <div class="p-6">
          <!-- Photo de profil -->
          <div class="flex items-center space-x-6 mb-8">
            <div class="relative">
              <div class="profile-avatar bg-gray-200 flex items-center justify-center" *ngIf="!profileImageUrl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-gray-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <img 
                *ngIf="profileImageUrl"
                [src]="profileImageUrl" 
                alt="Photo de profil"
                class="profile-avatar"
                (error)="onImageError($event)"
              />
              <button 
                (click)="triggerPhotoUpload()"
                class="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors shadow-lg"
                title="Changer la photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </button>
              <input 
                #photoInput 
                type="file" 
                accept="image/*" 
                (change)="onPhotoSelected($event)" 
                class="hidden"
              />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ currentUser?.fullName || 'Enseignant' }}</h2>
              <p class="text-gray-600">{{ currentUser?.email }}</p>
              <p class="text-sm text-indigo-600 font-medium">Enseignant</p>
            </div>
          </div>

          <!-- Formulaire de profil -->
          <form [formGroup]="profileForm" (ngSubmit)="onSubmitProfile()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input 
                  type="text" 
                  formControlName="fullName"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  formControlName="email"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input 
                  type="tel" 
                  formControlName="telephone"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Département</label>
                <input 
                  type="text" 
                  formControlName="departement"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre département"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
              <input 
                type="text" 
                formControlName="specialite"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Votre spécialité d'enseignement"
              />
            </div>

            <div class="flex justify-end space-x-4">
              <button 
                type="button"
                class="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit"
                [disabled]="!profileForm.valid || isSubmitting"
                class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span *ngIf="!isSubmitting">Mettre à jour</span>
                <span *ngIf="isSubmitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mise à jour...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #e5e7eb;
    }
  `]
})
export class EnseignantProfilPageComponent implements OnInit {
  @ViewChild('photoInput') photoInput: any;

  profileForm: FormGroup;
  currentUser: CurrentUser | null = null;
  profileImageUrl: string = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private http: HttpClient,
    private modalService: NgbModal,
    private profileImageService: ProfileImageService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      departement: [''],
      specialite: ['']
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.loadUserData();
    this.loadProfileImage();
  }

  loadUserData() {
    if (this.currentUser?.id) {
      this.http.get<any>(`${environment.apiUrl}/enseignants/${this.currentUser.id}`).subscribe({
        next: (userData) => {
          console.log('Données enseignant chargées:', userData);
          
          this.profileForm.patchValue({
            fullName: `${userData.prenom || ''} ${userData.nom || ''}`.trim(),
            email: userData.email || '',
            telephone: userData.telephone || '',
            departement: userData.departement || '',
            specialite: userData.specialite || ''
          });
        },
        error: (err) => {
          console.error('Erreur chargement données enseignant:', err);
        }
      });
    }
  }

  loadProfileImage() {
    this.profileImageService.loadProfileImage().subscribe({
      next: (imageUrl: string | null) => {
        if (imageUrl) {
          console.log('✅ Photo chargée au démarrage:', imageUrl);
          this.profileImageUrl = imageUrl;
        } else {
          console.log('Aucune photo au démarrage');
          this.profileImageUrl = '';
        }
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement photo:', err);
        this.profileImageUrl = '';
      }
    });
  }

  triggerPhotoUpload() {
    this.photoInput.nativeElement.click();
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      this.toast.show('Veuillez sélectionner une image valide', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      this.toast.show('L\'image ne doit pas dépasser 5MB', 'error');
      return;
    }

    // Prévisualisation immédiate
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profileImageUrl = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload via le service
    this.profileImageService.uploadProfileImage(file).subscribe({
      next: (response: any) => {
        console.log('✅ Photo uploadée avec succès:', response);
        
        // Recharger l'image depuis le serveur
        setTimeout(() => {
          this.profileImageService.loadProfileImage().subscribe({
            next: (imageUrl: string | null) => {
              if (imageUrl) {
                this.profileImageUrl = imageUrl;
                
                // Mettre à jour l'avatar dans le header
                if (this.authService.currentUser) {
                  this.authService.currentUser.avatarUrl = imageUrl;
                  this.authService.currentUser = this.authService.currentUser;
                }
              }
            }
          });
        }, 1000);
        
        this.toast.show('Photo de profil mise à jour avec succès', 'success');
      },
      error: (err) => {
        console.error('❌ Erreur upload photo:', err);
        this.toast.show('Erreur lors de l\'upload de la photo', 'error');
      }
    });
  }

  onSubmitProfile() {
    if (this.profileForm.valid && this.currentUser?.id) {
      this.isSubmitting = true;
      const formData = this.profileForm.value;
      
      console.log('=== SOUMISSION PROFIL ENSEIGNANT ===');
      console.log('Données du formulaire:', formData);
      console.log('User ID:', this.currentUser.id);
      
      // Créer FormData pour l'API
      const apiFormData = new FormData();
      
      // Séparer le nom complet en nom et prénom
      const fullNameParts = (formData.fullName || '').split(' ');
      const prenom = fullNameParts[0] || '';
      const nom = fullNameParts.slice(1).join(' ') || '';
      
      console.log('Nom séparé:', { nom, prenom });
      
      apiFormData.append('nom', nom);
      apiFormData.append('prenom', prenom);
      apiFormData.append('email', formData.email || '');
      apiFormData.append('telephone', formData.telephone || '');
      apiFormData.append('departement', formData.departement || '');
      apiFormData.append('specialite', formData.specialite || '');

      console.log('URL appelée:', `${environment.apiUrl}/enseignants/${this.currentUser.id}`);

      this.http.put(`${environment.apiUrl}/enseignants/${this.currentUser.id}`, apiFormData).subscribe({
        next: (response: any) => {
          console.log('✅ Profil enseignant mis à jour:', response);
          this.toast.show('Profil mis à jour avec succès', 'success');
          this.isSubmitting = false;
          
          // Mettre à jour les données locales
          if (this.currentUser) {
            this.currentUser.fullName = formData.fullName;
            this.authService.currentUser = this.currentUser;
          }
        },
        error: (err) => {
          console.error('❌ Erreur mise à jour profil:', err);
          this.toast.show('Erreur lors de la mise à jour du profil', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.toast.show('Veuillez remplir tous les champs requis', 'error');
    }
  }

  onImageError(event: any) {
    console.error('❌ Erreur de chargement de l\'image:', event.target?.src);
    this.profileImageUrl = '';
  }
}
