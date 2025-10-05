import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProfileImageService } from '../../core/services/profile-image.service';

@Component({
  selector: 'app-entreprise-profil-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6 space-y-6">
      <!-- En-tête -->
      <div class="bg-white rounded-lg border p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Profil de l'entreprise</h1>
        <p class="text-gray-600">Gérez les informations de votre entreprise</p>
      </div>

      <!-- Photo de profil -->
      <div class="bg-white rounded-lg border p-6">
        <h2 class="text-lg font-semibold mb-4">Logo de l'entreprise</h2>
        <div class="flex items-center space-x-6">
          <div class="relative">
            <div class="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                *ngIf="profileImageUrl" 
                [src]="profileImageUrl" 
                alt="Logo entreprise"
                class="w-full h-full object-cover"
                (error)="onImageError()"
                (load)="onImageLoad()"
              />
              <svg *ngIf="!profileImageUrl" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m0-18H21m-1.5 18V3M9 9l1.5 1.5L15 6" />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <input 
              #fileInput 
              type="file" 
              accept="image/*" 
              (change)="onImageSelected($event)"
              class="hidden"
            />
            <button 
              (click)="fileInput.click()"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-3"
            >
              📷 Changer le logo
            </button>
            <button 
              *ngIf="profileImageUrl"
              (click)="removeProfileImage()"
              class="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- Informations de l'entreprise -->
      <div class="bg-white rounded-lg border p-6">
        <h2 class="text-lg font-semibold mb-4">Informations de l'entreprise</h2>
        <form [formGroup]="profilForm" (ngSubmit)="updateProfil()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise *</label>
              <input 
                formControlName="nom"
                type="text" 
                class="w-full border rounded px-3 py-2"
                placeholder="Nom de l'entreprise"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input 
                formControlName="email"
                type="email" 
                class="w-full border rounded px-3 py-2"
                placeholder="contact@entreprise.com"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input 
                formControlName="telephone"
                type="tel" 
                class="w-full border rounded px-3 py-2"
                placeholder="01 23 45 67 89"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Site web</label>
              <input 
                formControlName="siteWeb"
                type="url" 
                class="w-full border rounded px-3 py-2"
                placeholder="https://www.entreprise.com"
              />
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <input 
                formControlName="adresse"
                type="text" 
                class="w-full border rounded px-3 py-2"
                placeholder="123 Rue de l'Entreprise, 75001 Paris"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Secteur d'activité</label>
              <select formControlName="secteurActivite" class="w-full border rounded px-3 py-2">
                <option value="">Sélectionner un secteur</option>
                <option value="INFORMATIQUE">Informatique</option>
                <option value="FINANCE">Finance</option>
                <option value="SANTE">Santé</option>
                <option value="EDUCATION">Éducation</option>
                <option value="COMMERCE">Commerce</option>
                <option value="INDUSTRIE">Industrie</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Taille de l'entreprise</label>
              <select formControlName="tailleEntreprise" class="w-full border rounded px-3 py-2">
                <option value="">Sélectionner la taille</option>
                <option value="TPE">TPE (1-9 salariés)</option>
                <option value="PME">PME (10-249 salariés)</option>
                <option value="ETI">ETI (250-4999 salariés)</option>
                <option value="GE">Grande entreprise (5000+ salariés)</option>
              </select>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                formControlName="description"
                rows="4" 
                class="w-full border rounded px-3 py-2"
                placeholder="Décrivez votre entreprise, ses activités, ses valeurs..."
              ></textarea>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button 
              type="submit"
              [disabled]="!profilForm.valid || isLoading"
              class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <span *ngIf="isLoading">Enregistrement...</span>
              <span *ngIf="!isLoading">Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Statistiques -->
      <div class="bg-white rounded-lg border p-6">
        <h2 class="text-lg font-semibold mb-4">Statistiques</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ stats.offresActives }}</div>
            <div class="text-sm text-gray-600">Offres actives</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ stats.candidaturesRecues }}</div>
            <div class="text-sm text-gray-600">Candidatures reçues</div>
          </div>
          <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">{{ stats.stagesEnCours }}</div>
            <div class="text-sm text-gray-600">Stages en cours</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ stats.conventionsSoumises }}</div>
            <div class="text-sm text-gray-600">Conventions soumises</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EntrepriseProfilPageComponent implements OnInit {
  profilForm: FormGroup;
  profileImageUrl: string | null = null;
  selectedFile: File | null = null;
  isLoading = false;
  
  stats = {
    offresActives: 0,
    candidaturesRecues: 0,
    stagesEnCours: 0,
    conventionsSoumises: 0
  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private http: HttpClient,
    private profileImageService: ProfileImageService
  ) {
    this.profilForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      siteWeb: [''],
      adresse: [''],
      secteurActivite: [''],
      tailleEntreprise: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfil();
    this.loadStats();
    
    // S'abonner aux changements de photo de profil
    this.profileImageService.profileImage$.subscribe(imageUrl => {
      this.profileImageUrl = imageUrl;
    });
    
    // Charger la photo de profil
    this.profileImageService.loadProfileImage();
  }

  loadProfil() {
    const user = this.auth.currentUser;
    if (!user) return;

    console.log('=== LOADING PROFILE ===');
    console.log('User ID:', user.id);

    // Charger les données depuis l'API
    this.http.get(`${environment.apiUrl}/entreprises/${user.id}`).subscribe({
      next: (data: any) => {
        console.log('Profile data received:', data);
        this.profilForm.patchValue(data);
        
        // Essayer plusieurs champs possibles pour l'URL du logo
        const logoUrl = data.logoUrl || data.logo || data.photoProfil || data.logoPath;
        if (logoUrl) {
          try {
            this.profileImageUrl = this.profileImageService.buildImageUrl(logoUrl);
            console.log('Logo URL set to (service):', this.profileImageUrl);
          } catch (e) {
            // Fallback
            if (logoUrl.startsWith('http')) this.profileImageUrl = logoUrl;
            else this.profileImageUrl = `${environment.apiUrl}/files/${logoUrl}`;
          }
        } else {
          this.profileImageUrl = null;
          console.log('No logo URL found in profile data');
        }
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
        this.toast.show('Erreur lors du chargement du profil', 'error');
      }
    });
  }

  loadStats() {
    const user = this.auth.currentUser;
    if (!user) return;

    // Charger les offres pour calculer les statistiques
    this.http.get<any[]>(`${environment.apiUrl}/offres/all`).subscribe({
      next: (offres) => {
        // Filtrer les offres de cette entreprise
        const mesOffres = offres.filter(o => o.entrepriseId === user.id);
        this.stats.offresActives = mesOffres.filter(o => o.estActive).length;
        
        // Charger les candidatures
        this.http.get<any[]>(`${environment.apiUrl}/candidatures/entreprise/${user.id}`).subscribe({
          next: (candidatures) => {
            this.stats.candidaturesRecues = candidatures.length;
            this.stats.stagesEnCours = candidatures.filter(c => c.statut === 'ACCEPTE').length;
          },
          error: (err) => console.error('Erreur candidatures:', err)
        });
      },
      error: (err) => {
        console.error('Erreur chargement offres:', err);
        // Utiliser les APIs individuelles si l'API groupée échoue
        this.loadStatsIndividually();
      }
    });
  }

  loadStatsIndividually() {
    const user = this.auth.currentUser;
    if (!user) return;

    // Statistiques par défaut si les APIs ne sont pas disponibles
    this.stats = {
      offresActives: 0,
      candidaturesRecues: 0,
      stagesEnCours: 0,
      conventionsSoumises: 0
    };
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('=== IMAGE SELECTED ===');
    console.log('File:', file.name, file.type, file.size);

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      this.toast.show('Veuillez sélectionner une image', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      this.toast.show('L\'image ne doit pas dépasser 5MB', 'error');
      return;
    }

    this.selectedFile = file;
    
    // Prévisualisation immédiate
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      this.profileImageUrl = previewUrl;
      console.log('Preview URL set:', previewUrl.substring(0, 50) + '...');
      
      // Upload après la prévisualisation
      setTimeout(() => {
        this.uploadProfileImage();
      }, 100);
    };
    reader.readAsDataURL(file);
  }

  uploadProfileImage() {
    if (!this.selectedFile) return;

    console.log('=== UPLOADING LOGO ===');
    console.log('File:', this.selectedFile.name, this.selectedFile.size);

    this.isLoading = true;
    
    // Utiliser le service centralisé pour l'upload
    this.profileImageService.uploadProfileImage(this.selectedFile).subscribe({
      next: (response: any) => {
        console.log('Logo uploadé avec succès:', response);
        this.toast.show('Logo mis à jour avec succès', 'success');
        this.isLoading = false;
        
        // Recharger la photo depuis le serveur après un délai
        setTimeout(() => {
          this.profileImageService.loadProfileImage();
        }, 1000);
      },
      error: (err) => {
        console.error('Erreur upload logo:', err);
        this.toast.show('Erreur lors de l\'upload du logo', 'error');
        this.isLoading = false;
      }
    });
  }

  removeProfileImage() {
    const user = this.auth.currentUser;
    if (!user) return;

    this.http.delete(`${environment.apiUrl}/entreprises/${user.id}/logo`).subscribe({
      next: () => {
        this.profileImageUrl = null;
        this.toast.show('Logo supprimé', 'success');
      },
      error: (err) => {
        console.error('Erreur suppression logo:', err);
        this.toast.show('Erreur lors de la suppression', 'error');
      }
    });
  }

  updateProfil() {
    if (!this.profilForm.valid) {
      this.toast.show('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) return;

    this.isLoading = true;
    const formValue = this.profilForm.value;
    
    console.log('=== UPDATING PROFILE ===');
    console.log('Form Value:', formValue);
    console.log('User ID:', user.id);

    // Utiliser JSON pour la mise à jour du profil (pas FormData pour éviter les conflits avec l'image)
    this.http.put(`${environment.apiUrl}/entreprises/${user.id}`, formValue, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        console.log('Profile update response:', response);
        this.toast.show('Profil mis à jour avec succès', 'success');
        this.isLoading = false;
        
        // Ne pas recharger tout le profil pour éviter de perdre l'image
        // Juste mettre à jour les champs du formulaire si nécessaire
        if (response && response.logoUrl && !this.profileImageUrl) {
          try {
            this.profileImageUrl = this.profileImageService.buildImageUrl(response.logoUrl);
          } catch (e) {
            this.profileImageUrl = response.logoUrl;
          }
        }
      },
      error: (err) => {
        console.error('Erreur mise à jour profil:', err);
        this.toast.show('Erreur lors de la mise à jour', 'error');
        this.isLoading = false;
      }
    });
  }

  onImageError() {
    console.log('=== IMAGE ERROR ===');
    console.log('Failed to load image:', this.profileImageUrl);
    // Ne pas effacer l'URL immédiatement, laisser une chance à l'image de se charger
  }

  onImageLoad() {
    console.log('=== IMAGE LOADED ===');
    console.log('Successfully loaded image:', this.profileImageUrl);
  }

}
