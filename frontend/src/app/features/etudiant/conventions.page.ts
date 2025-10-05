import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

interface Convention {
  id: number;
  titre?: string;
  statut: string;
  dateDebut?: string;
  dateFin?: string;
  gratification?: number;
  entreprise?: {
    nom: string;
  };
  offre?: {
    titre: string;
  };
  createdAt?: string;
}

@Component({
  selector: 'app-etudiant-conventions-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mes conventions de stage</h1>
          <p class="text-gray-600">Consultez vos conventions de stage validées</p>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-600">{{ getConventionsByStatus('BROUILLON').length }}</div>
          <div class="text-sm text-blue-600">Brouillons</div>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-yellow-600">{{ getConventionsByStatus('SOUMISE').length }}</div>
          <div class="text-sm text-yellow-600">Soumises</div>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-600">{{ getConventionsByStatus('VALIDEE').length }}</div>
          <div class="text-sm text-green-600">Validées</div>
        </div>
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div class="text-2xl font-bold text-purple-600">{{ getConventionsByStatus('SIGNEE').length }}</div>
          <div class="text-sm text-purple-600">Signées</div>
        </div>
      </div>

      <!-- Tableau des conventions -->
      <div class="bg-white border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left p-4 font-medium text-gray-900">Entreprise</th>
                <th class="text-left p-4 font-medium text-gray-900">Offre</th>
                <th class="text-left p-4 font-medium text-gray-900">Période</th>
                <th class="text-left p-4 font-medium text-gray-900">Gratification</th>
                <th class="text-left p-4 font-medium text-gray-900">Statut</th>
                <th class="text-left p-4 font-medium text-gray-900">Date création</th>
                <th class="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let convention of conventions" class="border-t hover:bg-gray-50">
                <td class="p-4">
                  <div class="font-medium text-gray-900">
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
                  <button 
                    (click)="viewConvention(convention)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Voir détails
                  </button>
                  <button 
                    *ngIf="convention.statut === 'VALIDEE' || convention.statut === 'SIGNEE'"
                    (click)="downloadConvention(convention)"
                    class="ml-3 text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Télécharger
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="conventions.length === 0" class="p-8 text-center text-gray-500">
          <div class="text-lg font-medium mb-2">Aucune convention trouvée</div>
          <p>Vos conventions de stage apparaîtront ici une fois créées par l'entreprise.</p>
        </div>
      </div>
    </div>
  `
})
export class EtudiantConventionsPageComponent implements OnInit {
  conventions: Convention[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadConventions();
  }

  loadConventions() {
    const currentUser = this.auth.currentUser;
    if (!currentUser?.id) return;

    this.loading = true;
    this.http.get<Convention[]>(`${environment.apiUrl}/conventions/etudiant/${currentUser.id}`).subscribe({
      next: (conventions) => {
        console.log('Conventions chargées:', conventions);
        this.conventions = conventions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement conventions:', err);
        this.loading = false;
      }
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
      'SOUMISE': 'Soumise',
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
    // TODO: Ouvrir modal de détails
    console.log('Voir convention:', convention);
  }

  downloadConvention(convention: Convention) {
    // TODO: Télécharger PDF de la convention
    console.log('Télécharger convention:', convention);
  }
}
