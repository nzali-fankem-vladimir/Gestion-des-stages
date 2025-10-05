import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
import { AdminService } from '../../../core/services/admin.service';
import { finalize } from 'rxjs/operators';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG' | string;
  user: string;
  action: string;
  details: string;
  ip: string;
}

interface LogFilter {
  level?: string;
  search?: string;
  date?: string;
  page?: number;
  pageSize?: number;
}

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
    <div class="space-y-6" [class.opacity-50]="loading" [class.pointer-events-none]="loading">
      <div *ngIf="loading" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-center">Chargement en cours...</p>
        </div>
      </div>

      <!-- Modal des détails du log -->
      <ng-template #logDetailsModal let-modal>
        <div class="modal-header bg-gray-100 px-6 py-4 border-b border-gray-200">
          <h5 class="text-lg font-semibold text-gray-900">Détails du log #{{selectedLog?.id}}</h5>
          <button type="button" class="text-gray-400 hover:text-gray-500" (click)="modal.dismiss()">
            <span class="sr-only">Fermer</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body p-6">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 class="text-sm font-medium text-gray-500">Date et heure</h6>
                <p class="mt-1 text-sm text-gray-900">{{selectedLog?.timestamp | date:'dd/MM/yyyy HH:mm:ss'}}</p>
              </div>
              <div>
                <h6 class="text-sm font-medium text-gray-500">Niveau</h6>
                <span class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                      [ngClass]="getLevelBadgeClass(selectedLog?.level || '')">
                  {{selectedLog?.level}}
                </span>
              </div>
              <div>
                <h6 class="text-sm font-medium text-gray-500">Utilisateur</h6>
                <p class="mt-1 text-sm text-gray-900">{{selectedLog?.user || 'Système'}}</p>
              </div>
              <div>
                <h6 class="text-sm font-medium text-gray-500">Adresse IP</h6>
                <p class="mt-1 text-sm text-gray-900">{{selectedLog?.ip || 'N/A'}}</p>
              </div>
              <div class="md:col-span-2">
                <h6 class="text-sm font-medium text-gray-500">Action</h6>
                <p class="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">{{selectedLog?.action}}</p>
              </div>
            </div>
            
            <div>
              <h6 class="text-sm font-medium text-gray-500">Détails</h6>
              <div class="mt-1 p-3 bg-gray-50 rounded-md">
                <pre class="text-sm text-gray-900 whitespace-pre-wrap">{{selectedLog?.details}}</pre>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button type="button" 
                  class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  (click)="modal.dismiss()">
            Fermer
          </button>
        </div>
      </ng-template>

      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Journaux système</h1>
        <button 
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          (click)="clearLogs()"
        >
          Vider les logs
        </button>
      </div>

      <!-- Filtres -->
      <div class="bg-white border rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select class="border rounded px-3 py-2" (change)="filterByLevel($event)">
            <option value="">Tous les niveaux</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
            <option value="DEBUG">Debug</option>
          </select>
          <input 
            type="text" 
            placeholder="Rechercher par utilisateur..." 
            class="border rounded px-3 py-2"
            (input)="searchLogs($event)"
          />
          <input 
            type="date" 
            class="border rounded px-3 py-2"
            (change)="filterByDate($event)"
          />
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            (click)="refreshLogs()"
          >
            Actualiser
          </button>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Total logs</div>
          <div class="text-2xl font-semibold text-gray-900">{{ logs.length }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Erreurs</div>
          <div class="text-2xl font-semibold text-red-600">{{ getCountByLevel('ERROR') }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Warnings</div>
          <div class="text-2xl font-semibold text-yellow-600">{{ getCountByLevel('WARNING') }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Info</div>
          <div class="text-2xl font-semibold text-blue-600">{{ getCountByLevel('INFO') }}</div>
        </div>
      </div>

      <!-- Liste des logs -->
      <div class="bg-white border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let log of filteredLogs" class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-xs text-gray-900" [title]="log.timestamp">
                    {{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                        [ngClass]="getLevelBadgeClass(log.level)">
                    {{ log.level }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-xs text-gray-900">{{ log.user }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-xs font-medium text-gray-900">{{ log.action }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-xs text-gray-900 max-w-xs truncate" [title]="log.details">
                    {{ log.details }}
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-xs text-gray-500">{{ log.ip }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    (click)="viewDetails(log)" 
                    class="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                    title="Voir les détails"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="filteredLogs.length === 0 && !loading" class="text-center py-8 text-gray-500">
          Aucun log ne correspond aux critères de recherche
        </div>
        
        <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">
                {{ error }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div class="text-sm text-gray-500">
          Affichage de {{ filteredLogs.length }} sur {{ totalItems }} entrées
        </div>
        
        <div class="flex items-center gap-2">
          <button 
            (click)="changePage(currentFilter.page! - 1)"
            [disabled]="currentFilter.page === 1"
            class="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          
          <div class="flex items-center gap-1">
            <span class="text-sm text-gray-700">Page</span>
            <span class="font-medium">{{ currentFilter.page || 1 }}</span>
            <span class="text-sm text-gray-500">/ {{ totalPages }}</span>
          </div>
          
          <button 
            (click)="changePage(currentFilter.page! + 1)"
            [disabled]="currentFilter.page === totalPages || totalPages === 0"
            class="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
          
          <div class="flex items-center ml-2">
            <span class="text-sm text-gray-500 mr-2">Afficher</span>
            <select 
              [(ngModel)]="currentFilter.pageSize"
              (change)="onFilterChange()"
              class="border rounded text-sm p-1"
            >
              <option [value]="10">10</option>
              <option [value]="20">20</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminLogsPageComponent implements OnInit {
  @ViewChild('logDetailsModal') logDetailsModal!: TemplateRef<any>;
  selectedLog: LogEntry | null = null;
  logs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  loading = false;
  error: string | null = null;
  
  // Filtres
  currentFilter: LogFilter = {
    level: '',
    search: '',
    date: '',
    page: 1,
    pageSize: 20
  };
  
  // Pagination
  totalItems = 0;
  totalPages = 1;
  
  // Options de filtre
  levelOptions = [
    { value: '', label: 'Tous les niveaux' },
    { value: 'INFO', label: 'Info' },
    { value: 'WARNING', label: 'Avertissement' },
    { value: 'ERROR', label: 'Erreur' },
    { value: 'DEBUG', label: 'Débogage' }
  ];
  
  constructor(
    private toast: ToastService,
    private adminService: AdminService,
    private modalService: NgbModal
  ) {}
  
  ngOnInit() {
    this.loadLogs();
  }
  
  loadLogs() {
    this.loading = true;
    this.error = null;
    
    // Dans une vraie application, on appellerait l'API avec les filtres
    // this.adminService.getLogs(this.currentFilter).subscribe({
    //   next: (response: any) => {
    //     this.logs = response.data;
    //     this.filteredLogs = [...this.logs];
    //     this.totalItems = response.total;
    //     this.totalPages = Math.ceil(response.total / (this.currentFilter.pageSize || 20));
    //     this.loading = false;
    //   },
    //   error: (err) => {
    //     console.error('Erreur lors du chargement des logs', err);
    //     this.error = 'Erreur lors du chargement des logs';
    //     this.loading = false;
    //     this.toast.show(this.error, 'error');
    //   }
    // });
    
    // Simulation de chargement
    setTimeout(() => {
      this.filteredLogs = [...this.logs];
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  applyFilters() {
    let result = [...this.logs];
    
    // Filtre par niveau
    if (this.currentFilter.level) {
      result = result.filter(log => log.level === this.currentFilter.level);
    }
    
    // Filtre par recherche
    if (this.currentFilter.search) {
      const searchTerm = this.currentFilter.search.toLowerCase();
      result = result.filter(log => 
        log.user.toLowerCase().includes(searchTerm) ||
        log.action.toLowerCase().includes(searchTerm) ||
        log.details.toLowerCase().includes(searchTerm) ||
        log.ip.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtre par date
    if (this.currentFilter.date) {
      result = result.filter(log => 
        new Date(log.timestamp).toISOString().split('T')[0] === this.currentFilter.date
      );
    }
    
    // Mise à jour de la pagination
    this.totalItems = result.length;
    this.totalPages = Math.ceil(this.totalItems / (this.currentFilter.pageSize || 20));
    
    // Application de la pagination
    const startIndex = ((this.currentFilter.page || 1) - 1) * (this.currentFilter.pageSize || 20);
    const endIndex = startIndex + (this.currentFilter.pageSize || 20);
    this.filteredLogs = result.slice(startIndex, endIndex);
  }
  
  onFilterChange() {
    this.currentFilter.page = 1; // Réinitialiser à la première page
    this.applyFilters();
  }
  
  filterByLevel(event: any) {
    this.currentFilter.level = event.target.value || '';
    this.onFilterChange();
  }

  searchLogs(event: any) {
    this.currentFilter.search = event.target.value || '';
    this.onFilterChange();
  }

  filterByDate(event: any) {
    this.currentFilter.date = event.target.value || '';
    this.onFilterChange();
  }
  
  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentFilter.page = newPage;
      this.applyFilters();
      window.scrollTo(0, 0);
    }
  }

  viewDetails(log: LogEntry) {
    this.selectedLog = log;
    this.modalService.open(this.logDetailsModal, { size: 'lg', centered: true });
  }

  getLevelBadgeClass(level: string): string {
    const classes: { [key: string]: string } = {
      'INFO': 'bg-blue-100 text-blue-800',
      'WARNING': 'bg-yellow-100 text-yellow-800',
      'ERROR': 'bg-red-100 text-red-800',
      'DEBUG': 'bg-gray-100 text-gray-800'
    };
    return classes[level] || 'bg-gray-100 text-gray-800';
  }

  getCountByLevel(level: string): number {
    return this.logs.filter(log => log.level === level).length;
  }

  refreshLogs() {
    this.loadLogs();
    this.toast.show('Logs actualisés', 'info');
  }

  clearLogs() {
    if (confirm('Êtes-vous sûr de vouloir vider tous les logs ? Cette action est irréversible.')) {
      this.loading = true;
      
      // Simulation d'appel API
      // this.adminService.clearLogs().subscribe({
      //   next: () => {
      //     this.loadLogs();
      //     this.toast.show('Tous les logs ont été supprimés', 'success');
      //   },
      //   error: (err) => {
      //     console.error('Erreur lors de la suppression des logs', err);
      //     this.loading = false;
      //     this.toast.show('Erreur lors de la suppression des logs', 'error');
      //   }
      // });
      
      // Simulation
      setTimeout(() => {
        this.logs = [];
        this.filteredLogs = [];
        this.loading = false;
        this.toast.show('Tous les logs ont été supprimés', 'success');
      }, 1000);
    }
  }
}
