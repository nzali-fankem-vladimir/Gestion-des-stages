import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService, AdminUserDto, CreateUserRequest } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

interface UserDetails {
  // Propriétés de base de AdminUserDto
  id: number;
  email: string;
  role: string;
  photoProfil?: string;
  fullName?: string;
  createdAt?: string;
  actif: boolean;
  
  // Propriétés supplémentaires pour la vue détaillée
  dateCreation?: string;
  dernierAcces?: string;
  statut: 'ACTIF' | 'INACTIF' | 'BLOQUE';
  
  // Autres propriétés optionnelles
  [key: string]: any;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  styles: [
    `
    /* Ajustements spécifiques pour la modale des détails utilisateur */
    .modal-content {
      border: none;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    .modal-header {
      border-bottom: 1px solid #e9ecef;
      background-color: #4f46e5;
      color: white;
      border-top-left-radius: 0.3rem;
      border-top-right-radius: 0.3rem;
    }
    
    .modal-title {
      font-weight: 600;
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    /* Styles pour la modal */
    .avatar-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .info-group {
      margin-bottom: 1rem;
    }
    
    .info-group label {
      margin-bottom: 0.25rem;
    }
    
    .btn-close-white {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      opacity: 0.7;
      cursor: pointer;
      padding: 0.5rem;
    }
    
    .btn-close-white:hover {
      opacity: 1;
    }
    
    /* Styles pour modal SANS backdrop */
    :host ::ng-deep .user-details-modal-no-backdrop .modal-backdrop {
      display: none !important; /* Suppression complète du backdrop */
    }
    
    :host ::ng-deep .user-details-modal-no-backdrop .modal-dialog {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
      border-radius: 0.75rem;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      background: white;
    }
    
    /* Ajustements pour les petits écrans */
    @media (max-width: 768px) {
      :host ::ng-deep .user-details-modal-no-backdrop .modal-dialog {
        margin: 1rem;
        max-width: calc(100% - 2rem);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1);
      }
    }
    `
  ],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Gestion des utilisateurs</h1>
        <div class="text-sm text-gray-500">
          Total: {{ users.length }} utilisateurs
        </div>
      </div>

      <!-- Bouton pour créer un utilisateur -->
      <div class="flex justify-between items-center">
        <button 
          class="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2"
          (click)="showCreateForm = !showCreateForm"
        >
          {{ showCreateForm ? 'Annuler' : 'Créer un utilisateur' }}
        </button>
      </div>

      <!-- Formulaire de création -->
      <div *ngIf="showCreateForm" class="bg-white border rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">Créer un nouvel utilisateur</h3>
        <form (ngSubmit)="createUser()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                class="mt-1 block w-full border rounded px-3 py-2"
                [(ngModel)]="newUser.email"
                name="email"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
              <div class="relative">
                <input 
                  [type]="showPassword ? 'text' : 'password'"
                  class="mt-1 block w-full border rounded px-3 py-2 pr-10"
                  [(ngModel)]="newUser.motDePasse"
                  name="password"
                  required
                />
                <button 
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  (click)="togglePasswordVisibility()"
                >
                  <svg *ngIf="!showPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="showPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Rôle</label>
            <select 
              class="mt-1 block w-full border rounded px-3 py-2"
              [(ngModel)]="newUser.role"
              name="role"
              required
            >
              <option value="">Sélectionner un rôle</option>
              <option value="ETUDIANT">Étudiant</option>
              <option value="ENSEIGNANT">Enseignant</option>
              <option value="ENTREPRISE">Entreprise</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button 
              type="submit" 
              class="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2"
              [disabled]="creating"
            >
              {{ creating ? 'Création...' : 'Créer' }}
            </button>
            <button 
              type="button" 
              class="border rounded px-4 py-2"
              (click)="showCreateForm = false"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>

      <!-- Filtres -->
      <div class="bg-white border rounded-lg p-4">
        <div class="flex gap-4">
          <select class="border rounded px-3 py-2" (change)="filterByRole($event)">
            <option value="">Tous les rôles</option>
            <option value="ETUDIANT">Étudiants</option>
            <option value="ENSEIGNANT">Enseignants</option>
            <option value="ENTREPRISE">Entreprises</option>
            <option value="ADMIN">Administrateurs</option>
          </select>
          <input 
            type="text" 
            placeholder="Rechercher par email..." 
            class="border rounded px-3 py-2 flex-1"
            (input)="searchUsers($event)"
          />
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
            (click)="loadUsers()"
          >
            Actualiser
          </button>
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="bg-white border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let user of filteredUsers" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-indigo-800">
                          {{ getInitials(getUserDisplayName(user)) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ getUserDisplayName(user) }}
                      </div>
                      <div class="text-sm text-gray-500">
                        ID: {{ user.id }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                        [ngClass]="getRoleBadgeClass(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                        [ngClass]="user.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ user.actif ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button 
                      class="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      (click)="viewUserDetails(user)"
                      type="button"
                    >
                      Voir
                    </button>
                    <button 
                      *ngIf="!user.actif"
                      class="px-3 py-1 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                      (click)="activateUser(user)"
                    >
                      Activer
                    </button>
                    <button 
                      *ngIf="user.actif && user.role !== 'ADMIN'"
                      class="px-3 py-1 text-xs font-medium rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                      (click)="deactivateUser(user)"
                    >
                      Désactiver
                    </button>
                    <button 
                      class="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      (click)="deleteUser(user)"
                      *ngIf="user.role !== 'ADMIN' || user.id !== currentUserId"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="filteredUsers.length === 0" class="text-center py-8 text-gray-500">
          Aucun utilisateur trouvé
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Étudiants</div>
          <div class="text-2xl font-semibold text-blue-600">{{ getCountByRole('ETUDIANT') }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Enseignants</div>
          <div class="text-2xl font-semibold text-green-600">{{ getCountByRole('ENSEIGNANT') }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Entreprises</div>
          <div class="text-2xl font-semibold text-purple-600">{{ getCountByRole('ENTREPRISE') }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Administrateurs</div>
          <div class="text-2xl font-semibold text-red-600">{{ getCountByRole('ADMIN') }}</div>
        </div>
      </div>
    </div>

    <!-- Modale des détails de l'utilisateur -->
    <ng-template #userDetailsModal let-modal>
      <div class="modal-header bg-indigo-600 text-white flex justify-between items-center px-6 py-4">
        <h4 class="text-lg font-semibold text-white">Détails de l'utilisateur</h4>
        <button type="button" 
                class="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all" 
                (click)="closeModal(modal)" 
                aria-label="Fermer"
                title="Fermer">
          ×
        </button>
      </div>
      
      <div class="modal-body p-6" *ngIf="selectedUser">
        <!-- En-tête avec avatar et infos principales -->
        <div class="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
            {{ getInitials(selectedUser.fullName || selectedUser.email) }}
          </div>
          <div class="flex-1">
            <h5 class="text-lg font-bold text-gray-900 mb-1">{{ selectedUser.fullName || 'Utilisateur' }}</h5>
            <p class="text-sm text-gray-600 mb-2">{{ selectedUser.email }}</p>
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                  [ngClass]="selectedUser.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ selectedUser.actif ? 'Actif' : 'Inactif' }}
            </span>
          </div>
        </div>

        <!-- Informations détaillées -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">ID Utilisateur</label>
            <p class="text-gray-900">#{{ selectedUser.id }}</p>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Rôle</label>
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" [ngClass]="getRoleBadgeClass(selectedUser.role)">
              {{ getRoleLabel(selectedUser.role) }}
            </span>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Date de création</label>
            <p class="text-gray-900">{{ formatDate(selectedUser.dateCreation) }}</p>
          </div>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-500">Dernière connexion</label>
            <p class="text-gray-900">{{ formatDate(selectedUser.dernierAcces) || 'Jamais connecté' }}</p>
          </div>
          
          <div class="col-span-1 md:col-span-2 space-y-2">
            <label class="text-sm font-medium text-gray-500">Statut du compte</label>
            <select class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    [(ngModel)]="selectedUser.statut"
                    (change)="onStatusChange($any($event).target.value)">
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="BLOQUE">Bloqué</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-between items-center">
        <div>
          <small class="text-gray-500">ID: #{{ selectedUser?.id }}</small>
        </div>
        <div class="flex space-x-2">
          <button type="button" 
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors" 
                  (click)="closeModal(modal)">
            Annuler
          </button>
          <button type="button" 
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors" 
                  (click)="closeModal(modal)">
            Fermer
          </button>
        </div>
      </div>
    </ng-template>

    <!-- Modale de confirmation d'activation -->
    <div *ngIf="showActivationModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">Activer l'utilisateur</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Êtes-vous sûr de vouloir activer l'utilisateur 
              <span class="font-semibold text-gray-700">{{ userToActivate?.email }}</span> ?
            </p>
            <p class="text-xs text-gray-400 mt-2">
              L'utilisateur pourra se connecter et accéder à l'application.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
              (click)="confirmActivation()"
            >
              Activer
            </button>
            <button
              class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              (click)="closeActivationModal()"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale de confirmation de désactivation -->
    <div *ngIf="showDeactivationModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
            <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">Désactiver l'utilisateur</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Êtes-vous sûr de vouloir désactiver l'utilisateur 
              <span class="font-semibold text-gray-700">{{ userToDeactivate?.email }}</span> ?
            </p>
            <p class="text-xs text-gray-400 mt-2">
              L'utilisateur ne pourra plus se connecter à l'application.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              class="px-4 py-2 bg-orange-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
              (click)="confirmDeactivation()"
            >
              Désactiver
            </button>
            <button
              class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              (click)="closeDeactivationModal()"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersPageComponent implements OnInit {
  @ViewChild('userDetailsModal') userDetailsModal!: TemplateRef<any>;
  selectedUser: UserDetails | null = null;
  users: AdminUserDto[] = [];
  filteredUsers: AdminUserDto[] = [];
  currentUserId: number = 0;
  showCreateForm = false;
  creating = false;
  showPassword = false;
  showActivationModal = false;
  userToActivate: AdminUserDto | null = null;
  showDeactivationModal = false;
  userToDeactivate: AdminUserDto | null = null;
  
  // Propriété pour la pagination
  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';
  
  newUser: CreateUserRequest = {
    email: '',
    motDePasse: '',
    role: 'ETUDIANT'
  };

  constructor(
    private adminService: AdminService,
    private toast: ToastService,
    private authService: AuthService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.currentUser?.id || 0;
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...this.users];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.toast.show('Erreur lors du chargement des utilisateurs', 'error');
      }
    });
  }

  createUser() {
    if (!this.newUser.email || !this.newUser.motDePasse || !this.newUser.role) {
      this.toast.show('Veuillez remplir tous les champs', 'error');
      return;
    }

    this.creating = true;
    this.adminService.createUser(this.newUser).subscribe({
      next: (user) => {
        this.toast.show('Utilisateur créé avec succès', 'success');
        this.loadUsers();
        this.showCreateForm = false;
        this.newUser = { email: '', motDePasse: '', role: 'ETUDIANT' };
        this.creating = false;
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        this.toast.show('Erreur lors de la création de l\'utilisateur', 'error');
        this.creating = false;
      }
    });
  }

  filterByRole(event: any) {
    const role = event.target.value;
    if (role) {
      this.filteredUsers = this.users.filter(user => user.role === role);
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  searchUsers(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.email.toLowerCase().includes(query) ||
      (user.fullName && user.fullName.toLowerCase().includes(query))
    );
  }

  getInitials(name: string | undefined | null): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'ETUDIANT': 'Étudiant',
      'ENSEIGNANT': 'Enseignant',
      'ENTREPRISE': 'Entreprise',
      'ADMIN': 'Admin'
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'ETUDIANT': 'bg-blue-100 text-blue-800',
      'ENSEIGNANT': 'bg-green-100 text-green-800',
      'ENTREPRISE': 'bg-purple-100 text-purple-800',
      'ADMIN': 'bg-red-100 text-red-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }

  getCountByRole(role: string): number {
    return this.users.filter(user => user.role === role).length;
  }

  viewUserDetails(user: AdminUserDto) {
    // Convertir AdminUserDto en UserDetails
    const userDetails: UserDetails = {
      id: user.id,
      email: user.email,
      role: user.role || 'ETUDIANT',
      photoProfil: user.photoProfil,
      fullName: user.fullName,
      createdAt: user.createdAt,
      actif: user.actif || false,
      statut: user.actif ? 'ACTIF' : 'INACTIF',
      dateCreation: user.createdAt,
      dernierAcces: ''
    };
    
    this.selectedUser = userDetails;
    
    // Configuration optimisée de la modale SANS backdrop
    const modalRef = this.modalService.open(this.userDetailsModal, {
      size: 'lg',
      backdrop: false,    // SUPPRESSION COMPLÈTE de l'assombrissement
      keyboard: true,     // Permet la fermeture avec Échap
      centered: true,
      scrollable: true,
      windowClass: 'user-details-modal-no-backdrop'
    });

    // Gestion de la fermeture de la modal
    modalRef.result.then(
      (result) => {
        console.log('Modal fermée avec résultat:', result);
        this.selectedUser = null;
      },
      (dismissed) => {
        console.log('Modal fermée sans résultat:', dismissed);
        this.selectedUser = null;
      }
    );
  }

  changeUserStatus(user: UserDetails, newStatus: 'ACTIF' | 'INACTIF' | 'BLOQUE') {
    this.adminService.updateUserStatus(user.id, newStatus).subscribe({
      next: (updatedUser: AdminUserDto) => {
        // Mettre à jour les propriétés de l'utilisateur avec la réponse du serveur
        if (user) {
          user.statut = newStatus;
          user.actif = newStatus === 'ACTIF';
          // Mettre à jour d'autres propriétés si nécessaire
          Object.assign(user, updatedUser);
        }
        this.toast.show(`Statut de l'utilisateur mis à jour avec succès`, 'success');
      },
      error: (error: any) => {
        console.error('Erreur lors de la mise à jour du statut', error);
        this.toast.show('Erreur lors de la mise à jour du statut', 'error');
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  deleteUser(user: AdminUserDto) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.email} ?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: (): void => {
          this.toast.show(`Utilisateur ${user.email} supprimé avec succès`, 'success');
          // Recharger la liste des utilisateurs après la suppression
          this.loadUsers();
        },
        error: (error: any): void => {
          console.error('Erreur lors de la suppression de l\'utilisateur:', error);
          const errorMessage = error.error?.message || 'Une erreur est survenue lors de la suppression';
          this.toast.show(`Erreur: ${errorMessage}`, 'error');
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onStatusChange(newStatus: 'ACTIF' | 'INACTIF' | 'BLOQUE') {
    if (this.selectedUser) {
      this.changeUserStatus(this.selectedUser, newStatus);
    }
  }

  activateUser(user: AdminUserDto) {
    this.userToActivate = user;
    this.showActivationModal = true;
  }

  confirmActivation() {
    if (this.userToActivate) {
      this.adminService.activateUser(this.userToActivate.id).subscribe({
        next: () => {
          this.toast.show(`Utilisateur ${this.userToActivate!.email} activé`, 'success');
          this.loadUsers();
          this.closeActivationModal();
        },
        error: (err) => {
          console.error('Erreur lors de l\'activation:', err);
          this.toast.show('Erreur lors de l\'activation', 'error');
          this.closeActivationModal();
        }
      });
    }
  }

  closeActivationModal() {
    this.showActivationModal = false;
    this.userToActivate = null;
  }

  deactivateUser(user: AdminUserDto) {
    this.userToDeactivate = user;
    this.showDeactivationModal = true;
  }

  confirmDeactivation() {
    if (this.userToDeactivate) {
      this.adminService.deactivateUser(this.userToDeactivate.id).subscribe({
        next: () => {
          this.toast.show(`Utilisateur ${this.userToDeactivate!.email} désactivé`, 'success');
          this.loadUsers();
          this.closeDeactivationModal();
        },
        error: (err) => {
          console.error('Erreur lors de la désactivation:', err);
          this.toast.show('Erreur lors de la désactivation', 'error');
          this.closeDeactivationModal();
        }
      });
    }
  }

  closeDeactivationModal() {
    this.showDeactivationModal = false;
    this.userToDeactivate = null;
  }

  getUserDisplayName(user: AdminUserDto): string {
    return user.fullName || user.email.split('@')[0];
  }

  closeModal(modal: any) {
    console.log('Fermeture de la modal...');
    console.log('Modal object:', modal);
    try {
      modal.dismiss('close');
      console.log('Modal.dismiss() appelé avec succès');
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
      modal.close();
    }
    this.selectedUser = null;
    console.log('selectedUser réinitialisé');
  }

  // Méthode alternative pour fermer la modal
  closeUserDetails() {
    this.selectedUser = null;
  }
}
