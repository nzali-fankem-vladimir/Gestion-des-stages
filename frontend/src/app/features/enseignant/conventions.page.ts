import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { NotificationService } from '../../core/services/notification.service';

interface Convention {
  id: number;
  titre?: string;
  statut: string;
  dateDebut?: string;
  dateFin?: string;
  gratification?: number;
  etudiant?: {
    nom: string;
    prenom: string;
    email: string;
  };
  entreprise?: {
    nom: string;
  };
  offre?: {
    titre: string;
  };
  createdAt?: string;
  objectifs?: string;
  missions?: string;
}

@Component({
  selector: 'app-enseignant-conventions-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Conventions à valider</h1>
          <p class="text-gray-600">Validez ou rejetez les conventions de stage soumises par les entreprises</p>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-yellow-600">{{ getConventionsByStatus('SOUMISE').length }}</div>
          <div class="text-sm text-yellow-600">En attente</div>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-600">{{ getConventionsByStatus('VALIDEE').length }}</div>
          <div class="text-sm text-green-600">Validées</div>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-red-600">{{ getConventionsByStatus('REJETEE').length }}</div>
          <div class="text-sm text-red-600">Rejetées</div>
        </div>
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-purple-600">{{ getConventionsByStatus('SIGNEE').length }}</div>
          <div class="text-sm text-purple-600">Signées</div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white border rounded-lg p-4">
        <div class="flex flex-wrap gap-4">
          <select 
            [(ngModel)]="selectedStatus" 
            (ngModelChange)="filterConventions()"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les statuts</option>
            <option value="SOUMISE">En attente</option>
            <option value="VALIDEE">Validées</option>
            <option value="REJETEE">Rejetées</option>
            <option value="SIGNEE">Signées</option>
          </select>
          
          <input 
            type="text" 
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterConventions()"
            placeholder="Rechercher par étudiant ou entreprise..."
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-64"
          />
        </div>
      </div>

      <!-- Tableau des conventions -->
      <div class="bg-white border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left p-4 font-medium text-gray-900">Étudiant</th>
                <th class="text-left p-4 font-medium text-gray-900">Entreprise</th>
                <th class="text-left p-4 font-medium text-gray-900">Offre</th>
                <th class="text-left p-4 font-medium text-gray-900">Période</th>
                <th class="text-left p-4 font-medium text-gray-900">Gratification</th>
                <th class="text-left p-4 font-medium text-gray-900">Statut</th>
                <th class="text-left p-4 font-medium text-gray-900">Date soumission</th>
                <th class="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let convention of filteredConventions" class="border-t hover:bg-gray-50">
                <td class="p-4">
                  <div class="font-medium text-gray-900">
                    {{ convention.etudiant?.prenom }} {{ convention.etudiant?.nom }}
                  </div>
                  <div class="text-gray-500 text-xs">
                    {{ convention.etudiant?.email }}
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-gray-900">
                    {{ convention.entreprise?.nom || 'N/A' }}
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-gray-900">
                    {{ convention.offre?.titre || convention.titre || 'N/A' }}
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-gray-900" *ngIf="convention.dateDebut && convention.dateFin">
                    {{ formatDate(convention.dateDebut) }} - {{ formatDate(convention.dateFin) }}
                  </div>
                  <div class="text-gray-500" *ngIf="!convention.dateDebut || !convention.dateFin">
                    Non définie
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-gray-900" *ngIf="convention.gratification">
                    {{ convention.gratification }}€/mois
                  </div>
                  <div class="text-gray-500" *ngIf="!convention.gratification">
                    Non définie
                  </div>
                </td>
                <td class="p-4">
                  <span [class]="getStatusClass(convention.statut)">
                    {{ getStatusLabel(convention.statut) }}
                  </span>
                </td>
                <td class="p-4 text-gray-500">
                  {{ formatDate(convention.createdAt) }}
                </td>
                <td class="p-4">
                  <div class="flex space-x-2">
                    <button 
                      (click)="viewConvention(convention)"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Voir
                    </button>
                    <button 
                      *ngIf="convention.statut === 'SOUMISE'"
                      (click)="validateConvention(convention)"
                      class="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Valider
                    </button>
                    <button 
                      *ngIf="convention.statut === 'SOUMISE'"
                      (click)="rejectConvention(convention)"
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Rejeter
                    </button>
                    <button 
                      *ngIf="convention.statut === 'VALIDEE' || convention.statut === 'SIGNEE'"
                      (click)="downloadConvention(convention)"
                      class="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      PDF
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="filteredConventions.length === 0" class="p-8 text-center text-gray-500">
          <div class="text-lg font-medium mb-2">Aucune convention trouvée</div>
          <p>Les conventions soumises par les entreprises apparaîtront ici.</p>
        </div>
      </div>
    </div>

    <!-- Modal de détails -->
    <div *ngIf="selectedConvention" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModal()">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-gray-900">Détails de la convention</h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Étudiant</label>
              <p class="text-gray-900">{{ selectedConvention.etudiant?.prenom }} {{ selectedConvention.etudiant?.nom }}</p>
              <p class="text-gray-500 text-sm">{{ selectedConvention.etudiant?.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Entreprise</label>
              <p class="text-gray-900">{{ selectedConvention.entreprise?.nom }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Offre de stage</label>
            <p class="text-gray-900">{{ selectedConvention.offre?.titre || selectedConvention.titre }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Date de début</label>
              <p class="text-gray-900">{{ formatDate(selectedConvention.dateDebut) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date de fin</label>
              <p class="text-gray-900">{{ formatDate(selectedConvention.dateFin) }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Gratification</label>
            <p class="text-gray-900">{{ selectedConvention.gratification || 0 }}€/mois</p>
          </div>

          <div *ngIf="selectedConvention.objectifs">
            <label class="block text-sm font-medium text-gray-700">Objectifs</label>
            <p class="text-gray-900 whitespace-pre-wrap">{{ selectedConvention.objectifs }}</p>
          </div>

          <div *ngIf="selectedConvention.missions">
            <label class="block text-sm font-medium text-gray-700">Missions</label>
            <p class="text-gray-900 whitespace-pre-wrap">{{ selectedConvention.missions }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Statut</label>
            <span [class]="getStatusClass(selectedConvention.statut)">
              {{ getStatusLabel(selectedConvention.statut) }}
            </span>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6" *ngIf="selectedConvention.statut === 'SOUMISE'">
          <button 
            (click)="rejectConvention(selectedConvention)"
            class="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
          >
            Rejeter
          </button>
          <button 
            (click)="validateConvention(selectedConvention)"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  `
})
export class EnseignantConventionsPageComponent implements OnInit {
  conventions: Convention[] = [];
  filteredConventions: Convention[] = [];
  selectedConvention: Convention | null = null;
  selectedStatus = '';
  searchTerm = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private toast: ToastService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadConventions();
  }

  loadConventions() {
    this.loading = true;
    this.http.get<Convention[]>(`${environment.apiUrl}/conventions/enseignant/all`).subscribe({
      next: (conventions) => {
        console.log('Conventions chargées:', conventions);
        this.conventions = conventions;
        this.filteredConventions = conventions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement conventions:', err);
        this.loading = false;
      }
    });
  }

  filterConventions() {
    this.filteredConventions = this.conventions.filter(convention => {
      const matchesStatus = !this.selectedStatus || convention.statut === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        convention.etudiant?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        convention.etudiant?.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        convention.entreprise?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  getConventionsByStatus(status: string): Convention[] {
    return this.conventions.filter(c => c.statut === status);
  }

  getStatusClass(statut: string): string {
    const classes = {
      'BROUILLON': 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800',
      'SOUMISE': 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800',
      'VALIDEE': 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
      'REJETEE': 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
      'SIGNEE': 'px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800'
    };
    return classes[statut as keyof typeof classes] || classes['BROUILLON'];
  }

  getStatusLabel(statut: string): string {
    const labels = {
      'BROUILLON': 'Brouillon',
      'SOUMISE': 'En attente',
      'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée',
      'SIGNEE': 'Signée'
    };
    return labels[statut as keyof typeof labels] || statut;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  viewConvention(convention: Convention) {
    this.selectedConvention = convention;
  }

  closeModal() {
    this.selectedConvention = null;
  }

  validateConvention(convention: Convention) {
    if (confirm(`Êtes-vous sûr de vouloir valider la convention de ${convention.etudiant?.prenom} ${convention.etudiant?.nom} ?`)) {
      this.http.put(`${environment.apiUrl}/conventions/${convention.id}/validate`, {}).subscribe({
        next: () => {
          this.toast.show('Convention validée avec succès', 'success');
          this.loadConventions();
          this.closeModal();
          
          // Envoyer notification automatique
          this.sendNotification(convention, 'VALIDEE');
        },
        error: (err) => {
          console.error('Erreur validation convention:', err);
          this.toast.show('Erreur lors de la validation', 'error');
        }
      });
    }
  }

  rejectConvention(convention: Convention) {
    const reason = prompt('Motif du rejet (optionnel):');
    if (reason !== null) { // null si annulé, string vide si OK sans texte
      this.http.put(`${environment.apiUrl}/conventions/${convention.id}/reject`, { reason }).subscribe({
        next: () => {
          this.toast.show('Convention rejetée', 'success');
          this.loadConventions();
          this.closeModal();
          
          // Envoyer notification automatique
          this.sendNotification(convention, 'REJETEE', reason);
        },
        error: (err) => {
          console.error('Erreur rejet convention:', err);
          this.toast.show('Erreur lors du rejet', 'error');
        }
      });
    }
  }

  downloadConvention(convention: Convention) {
    // TODO: Télécharger PDF de la convention
    console.log('Télécharger convention:', convention);
    this.toast.show('Fonctionnalité de téléchargement à implémenter', 'info');
  }

  private sendNotification(convention: Convention, action: string, reason?: string) {
    if (convention.etudiant?.email && convention.entreprise?.nom) {
      this.notificationService.notifyConventionValidation(
        convention.etudiant.email,
        convention.entreprise.nom,
        action as 'VALIDEE' | 'REJETEE',
        reason
      );
    }
  }
}
