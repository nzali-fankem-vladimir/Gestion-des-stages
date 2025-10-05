import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, CurrentUser } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileImageService } from '../../core/services/profile-image.service';

@Component({
  selector: 'app-etudiant-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styles: [
    `
    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #e5e7eb;
    }
    
    .upload-zone {
      border: 2px dashed #d1d5db;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }
    
    .upload-zone:hover {
      border-color: #6366f1;
      background-color: #f8fafc;
    }
    
    .upload-zone.dragover {
      border-color: #6366f1;
      background-color: #eef2ff;
    }
    
    /* Styles pour modales sans backdrop */
    :host ::ng-deep .modal-no-backdrop .modal-backdrop {
      display: none !important;
    }
    
    :host ::ng-deep .modal-no-backdrop .modal-dialog {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
      border-radius: 0.75rem;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      background: white;
    }
    `
  ],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Mon Profil</h1>
        
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
              type="button"
              class="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors"
              (click)="triggerPhotoUpload()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </button>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ currentUser?.fullName || 'Utilisateur' }}</h3>
            <p class="text-sm text-gray-500">{{ currentUser?.email }}</p>
            <p class="text-sm text-indigo-600 font-medium">Étudiant</p>
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
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Votre nom complet"
              />
              <div *ngIf="profileForm.get('fullName')?.invalid && profileForm.get('fullName')?.touched" class="text-red-500 text-sm mt-1">
                Le nom complet est requis
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                formControlName="email"
                class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                readonly
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input 
                type="tel" 
                formControlName="telephone"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Votre numéro de téléphone"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
              <input 
                type="date" 
                formControlName="dateNaissance"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
            <textarea 
              formControlName="adresse"
              rows="3"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Votre adresse complète"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button 
              type="submit" 
              [disabled]="profileForm.invalid || isSubmitting"
              class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span *ngIf="!isSubmitting">Mettre à jour le profil</span>
              <span *ngIf="isSubmitting">Mise à jour...</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Section CV -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Curriculum Vitae</h2>
        
        <div *ngIf="currentCv" class="mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-red-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 18H9a2.25 2.25 0 01-2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h4.125M8.25 8.25V6.108" />
              </svg>
              <div>
                <p class="font-medium text-gray-900">{{ currentCv.name }}</p>
                <p class="text-sm text-gray-500">{{ formatFileSize(currentCv.size) }} • Téléchargé le {{ formatDate(currentCv.uploadDate) }}</p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button 
                type="button"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                (click)="downloadCv()"
              >
                Télécharger
              </button>
              <button 
                type="button"
                class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                (click)="deleteCv()"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <div 
          class="upload-zone p-8 text-center cursor-pointer"
          (click)="triggerCvUpload()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          [class.dragover]="isDragOver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-gray-400 mx-auto mb-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p class="text-lg font-medium text-gray-900 mb-2">
            {{ currentCv ? 'Remplacer le CV' : 'Télécharger votre CV' }}
          </p>
          <p class="text-sm text-gray-500 mb-4">
            Glissez-déposez votre fichier PDF ici ou cliquez pour sélectionner
          </p>
          <p class="text-xs text-gray-400">
            Formats acceptés: PDF • Taille max: 5MB
          </p>
        </div>
      </div>

      <!-- Inputs cachés pour les uploads -->
      <input 
        #photoInput 
        type="file" 
        accept="image/*" 
        (change)="onPhotoSelected($event)"
        class="hidden"
      />
      <input 
        #cvInput 
        type="file" 
        accept=".pdf" 
        (change)="onCvSelected($event)"
        class="hidden"
      />
    </div>

    <!-- Modal de confirmation de téléchargement CV -->
    <ng-template #downloadConfirmModal let-modal>
      <div class="modal-header bg-blue-600 text-white flex justify-between items-center px-6 py-4">
        <h4 class="text-lg font-semibold text-white">Téléchargement CV</h4>
        <button type="button" 
                class="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all" 
                (click)="closeModal(modal)" 
                aria-label="Fermer">
          ×
        </button>
      </div>
      
      <div class="modal-body p-6">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <div>
            <h5 class="text-lg font-medium text-gray-900">{{ downloadMessage?.title }}</h5>
            <p class="text-sm text-gray-600">{{ downloadMessage?.message }}</p>
          </div>
        </div>
        
        <div *ngIf="downloadMessage?.type === 'success'" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-green-800">✅ {{ downloadMessage?.details }}</p>
        </div>
        
        <div *ngIf="downloadMessage?.type === 'warning'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-yellow-800">⚠️ {{ downloadMessage?.details }}</p>
        </div>
        
        <div *ngIf="downloadMessage?.type === 'info'" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-blue-800">ℹ️ {{ downloadMessage?.details }}</p>
        </div>
      </div>
      
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-end">
        <button type="button" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" 
                (click)="closeModal(modal)">
          Compris
        </button>
      </div>
    </ng-template>

    <!-- Modal de confirmation de suppression CV -->
    <ng-template #deleteConfirmModal let-modal>
      <div class="modal-header bg-red-600 text-white flex justify-between items-center px-6 py-4">
        <h4 class="text-lg font-semibold text-white">Supprimer le CV</h4>
        <button type="button" 
                class="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all" 
                (click)="closeModal(modal)" 
                aria-label="Fermer">
          ×
        </button>
      </div>
      
      <div class="modal-body p-6">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-red-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <h5 class="text-lg font-medium text-gray-900">Confirmer la suppression</h5>
            <p class="text-sm text-gray-600">Cette action est irréversible</p>
          </div>
        </div>
        
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">
            Êtes-vous sûr de vouloir supprimer le CV 
            <span class="font-semibold">"{{ cvToDelete?.name }}"</span> ?
          </p>
          <p class="text-red-600 text-sm mt-2">
            Vous devrez le télécharger à nouveau si vous souhaitez le récupérer.
          </p>
        </div>
      </div>
      
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-between">
        <button type="button" 
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors" 
                (click)="closeModal(modal)">
          Annuler
        </button>
        <button type="button" 
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors" 
                (click)="confirmDeleteCv(modal)">
          Supprimer
        </button>
      </div>
    </ng-template>
  `
})
export class EtudiantProfilPageComponent implements OnInit {
  @ViewChild('downloadConfirmModal') downloadConfirmModal!: TemplateRef<any>;
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: TemplateRef<any>;
  
  profileForm: FormGroup;
  currentUser: CurrentUser | null = null;
  profileImageUrl: string = '';
  currentCv: any = null;
  cvToDelete: any = null;
  downloadMessage: any = null;
  isSubmitting = false;
  isDragOver = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private http: HttpClient,
    private modalService: NgbModal,
    private profileImageService: ProfileImageService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      dateNaissance: [''],
      adresse: ['']
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.loadUserData();
    this.loadTestCv();
    this.loadProfileImageDirect();
  }

  loadProfileImageDirect() {
    if (!this.currentUser?.id) {
      console.log('Pas d\'utilisateur pour charger la photo');
      return;
    }

    console.log('=== CHARGEMENT PHOTO AU DÉMARRAGE ===');
    console.log('User ID:', this.currentUser.id);
    
    // Utiliser le ProfileImageService pour un chargement cohérent
    this.profileImageService.loadProfileImage().subscribe({
      next: (imageUrl: string | null) => {
        if (imageUrl) {
          console.log('✅ Photo chargée au démarrage via ProfileImageService:', imageUrl);
          this.profileImageUrl = imageUrl;
        } else {
          console.log('Aucune photo au démarrage');
          this.profileImageUrl = '';
        }
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement photo au démarrage:', err);
        this.profileImageUrl = '';
      }
    });
  }

  initializeForm() {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      dateNaissance: [''],
      adresse: ['']
    });
  }

  loadUserData() {
    // Utiliser directement currentUser du service auth
    this.currentUser = this.authService.currentUser;
    
    if (this.currentUser) {
      this.profileForm.patchValue({
        fullName: this.currentUser.fullName || '',
        email: this.currentUser.email || '',
        telephone: (this.currentUser as any).telephone || '',
        dateNaissance: (this.currentUser as any).dateNaissance || '',
        adresse: (this.currentUser as any).adresse || ''
      });
    } else {
      this.toast.show('Erreur lors du chargement du profil', 'error');
    }
  }

  loadTestCv() {
    // TODO: Implémenter le chargement des informations du CV depuis l'API
    // this.utilisateurService.getCvInfo().subscribe(...)
    
    // Simulation temporaire - CV de test s'il n'y en a pas
    if (!this.currentCv) {
      // Simuler un CV existant pour les tests
      this.currentCv = {
        name: 'Projet 1 Modélisation UML... Système de Gestion de Bibliothèque.pdf',
        size: 2180000, // ~2.18 MB
        uploadDate: new Date('2025-09-20'),
        localUrl: null // Pas d'URL locale pour ce CV fictif
      };
      console.log('CV de test chargé:', this.currentCv);
    }
  }

  onSubmitProfile() {
    if (this.profileForm.valid && this.currentUser?.id) {
      this.isSubmitting = true;
      const formData = this.profileForm.value;
      
      console.log('=== MISE À JOUR PROFIL ===');
      console.log('User ID:', this.currentUser.id);
      console.log('Form data:', formData);
      
      // Créer FormData pour l'API
      const apiFormData = new FormData();
      
      // Séparer le nom complet en nom et prénom
      const fullNameParts = (formData.fullName || '').split(' ');
      const prenom = fullNameParts[0] || '';
      const nom = fullNameParts.slice(1).join(' ') || '';
      
      apiFormData.append('nom', nom);
      apiFormData.append('prenom', prenom);
      apiFormData.append('matricule', formData.matricule || '');
      apiFormData.append('filiere', formData.filiere || '');
      
      this.http.put(`${environment.apiUrl}/etudiants/${this.currentUser.id}`, apiFormData).subscribe({
        next: (response: any) => {
          console.log('=== RÉPONSE MISE À JOUR PROFIL ===');
          console.log('Response:', response);
          
          this.toast.show('Profil mis à jour avec succès', 'success');
          this.isSubmitting = false;
          
          // Mettre à jour les données locales
          if (this.currentUser) {
            this.currentUser.fullName = formData.fullName;
            this.authService.currentUser = this.currentUser;
          }
          
          // Recharger les données du profil
          this.loadUserData();
        },
        error: (err) => {
          console.error('=== ERREUR MISE À JOUR PROFIL ===');
          console.error('Status:', err.status);
          console.error('Error:', err.error);
          console.error('Message:', err.message);
          
          this.toast.show('Erreur lors de la mise à jour du profil', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.toast.show('Veuillez remplir tous les champs requis', 'error');
    }
  }

  triggerPhotoUpload() {
    console.log('Bouton photo cliqué');
    const photoInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    if (photoInput) {
      console.log('Input photo trouvé, ouverture du sélecteur');
      photoInput.click();
    } else {
      console.error('Input photo non trouvé');
      this.toast.show('Erreur: sélecteur de fichier non trouvé', 'error');
    }
  }

  triggerCvUpload() {
    console.log('Bouton CV cliqué');
    const cvInput = document.querySelector('input[type="file"][accept=".pdf"]') as HTMLInputElement;
    if (cvInput) {
      console.log('Input CV trouvé, ouverture du sélecteur');
      cvInput.click();
    } else {
      console.error('Input CV non trouvé');
      this.toast.show('Erreur: sélecteur de fichier non trouvé', 'error');
    }
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadPhoto(file);
    }
  }

  onCvSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadCv(file);
    }
  }

  uploadPhoto(file: File) {
    console.log('Upload photo démarré:', file.name, file.size, file.type);
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      this.toast.show('La photo ne doit pas dépasser 5MB', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.toast.show('Seuls les fichiers image sont acceptés', 'error');
      return;
    }

    // Prévisualisation immédiate
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profileImageUrl = e.target.result;
      console.log('Prévisualisation chargée');
    };
    reader.readAsDataURL(file);
    // Utiliser le ProfileImageService pour un upload cohérent
    this.profileImageService.uploadProfileImage(file).subscribe({
      next: (response: any) => {
        console.log('✅ Photo uploadée avec succès via ProfileImageService:', response);
        
        // Recharger l'image depuis le serveur après un délai
        setTimeout(() => {
          this.profileImageService.loadProfileImage().subscribe({
            next: (imageUrl: string | null) => {
              if (imageUrl) {
                console.log('✅ Image rechargée depuis le serveur:', imageUrl);
                this.profileImageUrl = imageUrl;
                
                // Forcer la mise à jour de l'avatar dans le header
                if (this.authService.currentUser) {
                  this.authService.currentUser.avatarUrl = imageUrl;
                  this.authService.currentUser = this.authService.currentUser;
                }
              }
            },
            error: (err: any) => {
              console.error('❌ Erreur rechargement image:', err);
            }
          });
        }, 1000);
        
        this.toast.show('Photo de profil mise à jour avec succès', 'success');
      },
      error: (err: any) => {
        console.error('❌ Erreur upload via ProfileImageService:', err);
        this.toast.show('Erreur lors de l\'upload de la photo', 'error');
      }
    });
  }

  uploadCv(file: File) {
    console.log('Upload CV démarré:', file.name, file.size, file.type);
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      this.toast.show('Le CV ne doit pas dépasser 5MB', 'error');
      return;
    }

    if (file.type !== 'application/pdf') {
      this.toast.show('Seuls les fichiers PDF sont acceptés', 'error');
      return;
    }

    // TODO: Implémenter l'upload de CV vers le serveur
    // const formData = new FormData();
    // formData.append('cv', file);
    // this.http.post('/api/profile/cv', formData).subscribe(...)
    
    // Simulation temporaire avec URL locale pour le téléchargement
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.currentCv = {
        name: file.name,
        size: file.size,
        uploadDate: new Date(),
        localUrl: e.target.result // Ajouter l'URL locale pour le téléchargement
      };
      console.log('✅ CV uploadé avec succès:', this.currentCv);
      
      // Message de succès professionnel
      this.toast.show(`CV "${file.name}" uploadé avec succès`, 'success');
    };
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        this.uploadCv(file);
      } else {
        this.toast.show('Seuls les fichiers PDF sont acceptés', 'error');
      }
    }
  }

  downloadCv() {
    console.log('🔽 BOUTON TÉLÉCHARGER CLIQUÉ');
    console.log('État du CV actuel:', this.currentCv);
    
    if (this.currentCv && this.currentCv.localUrl) {
      console.log('✅ CV avec URL locale trouvé, téléchargement...');
      
      // Créer un lien de téléchargement temporaire
      const link = document.createElement('a');
      link.href = this.currentCv.localUrl;
      link.download = this.currentCv.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Afficher modal de succès
      this.downloadMessage = {
        type: 'success',
        title: 'Téléchargement réussi',
        message: 'Votre CV a été téléchargé avec succès',
        details: `Le fichier "${this.currentCv.name}" a été sauvegardé dans vos téléchargements.`
      };
      this.showDownloadModal();
      
    } else if (this.currentCv && !this.currentCv.localUrl) {
      console.log('⚠️ CV existe mais pas d\'URL locale');
      
      // Afficher modal d'information
      this.downloadMessage = {
        type: 'info',
        title: 'Téléchargement depuis le serveur',
        message: 'Ce CV provient du serveur',
        details: 'La fonctionnalité de téléchargement depuis le serveur est en cours de développement.'
      };
      this.showDownloadModal();
      
    } else {
      console.log('❌ Aucun CV disponible');
      
      // Afficher modal d'avertissement
      this.downloadMessage = {
        type: 'warning',
        title: 'Aucun CV disponible',
        message: 'Vous n\'avez pas encore uploadé de CV',
        details: 'Veuillez d\'abord télécharger un fichier PDF dans la section CV ci-dessus.'
      };
      this.showDownloadModal();
    }
  }

  deleteCv() {
    console.log('🗑️ BOUTON SUPPRIMER CLIQUÉ');
    
    if (this.currentCv) {
      this.cvToDelete = this.currentCv;
      this.showDeleteModal();
    } else {
      this.downloadMessage = {
        type: 'warning',
        title: 'Aucun CV à supprimer',
        message: 'Vous n\'avez pas de CV actuellement',
        details: 'Il n\'y a aucun CV à supprimer.'
      };
      this.showDownloadModal();
    }
  }

  confirmDeleteCv(modal: any) {
    if (this.cvToDelete) {
      const cvName = this.cvToDelete.name;
      
      // TODO: Implémenter la suppression du CV sur le serveur
      this.currentCv = null;
      this.cvToDelete = null;
      
      this.toast.show(`CV "${cvName}" supprimé avec succès`, 'success');
      console.log('✅ CV supprimé:', cvName);
      
      this.closeModal(modal);
    }
  }

  showDownloadModal() {
    const modalRef = this.modalService.open(this.downloadConfirmModal, {
      size: 'md',
      backdrop: false,
      keyboard: true,
      centered: true,
      windowClass: 'modal-no-backdrop'
    });
  }

  showDeleteModal() {
    const modalRef = this.modalService.open(this.deleteConfirmModal, {
      size: 'md',
      backdrop: false,
      keyboard: true,
      centered: true,
      windowClass: 'modal-no-backdrop'
    });
  }

  closeModal(modal: any) {
    try {
      modal.dismiss('close');
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
      modal.close();
    }
  }

  onImageError(event: any) {
    console.error('❌ Erreur de chargement de l\'image:', event.target?.src);
    console.log('Masquage de l\'image et affichage de l\'avatar par défaut');
    this.profileImageUrl = ''; // Masquer l'image et afficher l'avatar par défaut
  }


  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
