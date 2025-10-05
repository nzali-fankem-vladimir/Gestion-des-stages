import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CandidatureService, CandidatureDto } from '../../core/services/candidature.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-candidatures-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [
    `
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
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <h2 class="text-2xl font-semibold">Mes candidatures</h2>
      <div class="flex items-center gap-2">
        <input class="border rounded px-3 py-2 text-sm" [(ngModel)]="q" name="q" placeholder="Rechercher..." (input)="applyFilters()" />
        <select class="border rounded px-3 py-2 text-sm" [(ngModel)]="sortKey" name="sortKey" (change)="applyFilters()">
          <option value="id">Trier par: #</option>
          <option value="statut">Statut</option>
          <option value="luParEntreprise">Lu</option>
        </select>
        <select class="border rounded px-3 py-2 text-sm" [(ngModel)]="pageSize" name="pageSize" (change)="applyFilters()">
          <option [ngValue]="5">5</option>
          <option [ngValue]="10">10</option>
          <option [ngValue]="20">20</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto bg-white border rounded">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left p-3">#</th>
            <th class="text-left p-3">Statut</th>
            <th class="text-left p-3">CV</th>
            <th class="text-left p-3">Lettre</th>
            <th class="text-left p-3">Lu par entreprise</th>
            <th class="text-right p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of paged" class="border-t">
            <td class="p-3">{{ c.id }}</td>
            <td class="p-3">{{ c.statut || '-' }}</td>
            <td class="p-3">{{ c.cvUrl || '-' }}</td>
            <td class="p-3">{{ c.lettreMotivation || '-' }}</td>
            <td class="p-3">{{ c.luParEntreprise ? 'Oui' : 'Non' }}</td>
            <td class="p-3">
              <div class="flex items-center justify-end gap-2">
                <button 
                  *ngIf="c.id" 
                  (click)="editCandidature(c)"
                  class="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  {{ c.statut === 'EN_ATTENTE' ? 'Éditer' : 'Voir' }}
                </button>
                <button 
                  *ngIf="c.statut === 'EN_ATTENTE'"
                  (click)="confirmDelete(c)" 
                  class="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  Supprimer
                </button>
                <span 
                  *ngIf="c.statut !== 'EN_ATTENTE'"
                  class="px-3 py-1 text-sm font-medium text-gray-500 bg-gray-50 rounded-md"
                >
                  Traitée
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div *ngIf="candidatures.length === 0" class="text-sm text-gray-500">Aucune candidature.</div>

    <!-- Pagination -->
    <div class="flex items-center justify-end gap-2" *ngIf="totalPages > 1">
      <button class="border rounded px-3 py-1 text-sm" [disabled]="page===1" (click)="goTo(page-1)">Préc.</button>
      <span class="text-sm">Page {{ page }} / {{ totalPages }}</span>
      <button class="border rounded px-3 py-1 text-sm" [disabled]="page===totalPages" (click)="goTo(page+1)">Suiv.</button>
    </div>
  </div>

  <!-- Modal de confirmation de suppression -->
  <ng-template #deleteConfirmModal let-modal>
    <div class="modal-header bg-red-600 text-white flex justify-between items-center px-6 py-4">
      <h4 class="text-lg font-semibold text-white">Confirmer la suppression</h4>
      <button type="button" 
              class="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all" 
              (click)="closeModal(modal)" 
              aria-label="Fermer">
        ×
      </button>
    </div>
    
    <div class="modal-body p-6" *ngIf="candidatureToDelete">
      <div class="flex items-start space-x-4 mb-6">
        <div class="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-red-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h5 class="text-lg font-medium text-gray-900">Confirmer la suppression</h5>
          <p class="text-sm text-gray-600">Cette action est irréversible</p>
        </div>
      </div>
      
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">
          Êtes-vous sûr de vouloir supprimer la candidature 
          <span class="font-semibold">#{{ candidatureToDelete.id }}</span> ?
        </p>
        <p class="text-red-600 text-sm mt-2">
          Cette candidature sera définitivement supprimée et ne pourra pas être récupérée.
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
              (click)="deleteCandidature(modal)">
        Supprimer
      </button>
    </div>
  </ng-template>

  <!-- Modal d'édition -->
  <ng-template #editModal let-modal>
    <div class="modal-header bg-blue-600 text-white flex justify-between items-center px-6 py-4">
      <h4 class="text-lg font-semibold text-white">Éditer la candidature</h4>
      <button type="button" 
              class="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all" 
              (click)="closeEditModal(modal)" 
              aria-label="Fermer">
        ×
      </button>
    </div>
    
    <div class="modal-body p-6" *ngIf="candidatureToEdit">
      <form (ngSubmit)="updateCandidature(modal)" class="space-y-4">
        <!-- Affichage du statut (lecture seule) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Statut actuel</label>
          <div class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
            <span class="text-gray-700">{{ getStatusLabel(candidatureToEdit.statut || '') }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Le statut est géré par l'entreprise</p>
        </div>

        <!-- Modification de la lettre seulement si EN_ATTENTE -->
        <div *ngIf="candidatureToEdit.statut === 'EN_ATTENTE'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Lettre de motivation</label>
          <textarea 
            [(ngModel)]="candidatureToEdit.lettreMotivation" 
            name="lettreMotivation"
            rows="4"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Votre lettre de motivation..."
          ></textarea>
        </div>

        <!-- Affichage de la lettre en lecture seule si pas EN_ATTENTE -->
        <div *ngIf="candidatureToEdit.statut !== 'EN_ATTENTE'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Lettre de motivation</label>
          <div class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
            <p class="text-gray-700 whitespace-pre-wrap">{{ candidatureToEdit.lettreMotivation || 'Aucune lettre de motivation' }}</p>
          </div>
          <p class="text-xs text-gray-500 mt-1">La lettre ne peut plus être modifiée après traitement par l'entreprise</p>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-yellow-800 text-sm">
            <strong>Information :</strong> 
            <span *ngIf="candidatureToEdit.statut === 'EN_ATTENTE'">Vous pouvez modifier votre lettre de motivation tant que l'entreprise n'a pas traité votre candidature.</span>
            <span *ngIf="candidatureToEdit.statut !== 'EN_ATTENTE'">Cette candidature a été traitée par l'entreprise. Seule la consultation est possible.</span>
          </p>
        </div>
      </form>
    </div>
    
    <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-between">
      <button type="button" 
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors" 
              (click)="closeEditModal(modal)">
        Fermer
      </button>
      <button type="button" 
              *ngIf="candidatureToEdit?.statut === 'EN_ATTENTE'"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" 
              (click)="updateCandidature(modal)">
        Mettre à jour
      </button>
    </div>
  </ng-template>
  `
})
export class CandidaturesPageComponent implements OnInit {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: TemplateRef<any>;
  @ViewChild('editModal') editModal!: TemplateRef<any>;
  
  candidatures: CandidatureDto[] = [];
  filtered: CandidatureDto[] = [];
  paged: CandidatureDto[] = [];
  candidatureToDelete: CandidatureDto | null = null;
  candidatureToEdit: CandidatureDto | null = null;
  q = '';
  sortKey: 'id' | 'statut' | 'luParEntreprise' = 'id';
  page = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private service: CandidatureService, 
    private auth: AuthService, 
    private toast: ToastService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    console.log('=== CANDIDATURES DEBUG ===');
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user found');
      return;
    }
    
    console.log('Calling API getByEtudiant with userId:', user.id);
    console.log('API URL will be:', `${this.service['base']}/etudiant/${user.id}`);
    
    // On suppose que user.id correspond à etudiantId quand role=ETUDIANT
    this.service.getByEtudiant(user.id).subscribe({
      next: (list) => {
        console.log('API candidatures response:', list);
        console.log('Number of candidatures:', list.length);
        if (list.length === 0) {
          console.log('No candidatures found for user ID:', user.id);
        }
        this.candidatures = list;
        this.applyFilters();
        console.log('After applyFilters - filtered:', this.filtered.length, 'paged:', this.paged.length);
      },
      error: (err) => {
        console.error('Erreur candidatures:', err);
        console.log('Error status:', err.status);
        console.log('Error message:', err.message);
        console.log('Error details:', err.error);
        this.toast.show('Erreur lors du chargement des candidatures', 'error');
      }
    });
  }

  applyFilters() {
    const q = this.q.toLowerCase().trim();
    this.filtered = this.candidatures.filter(c =>
      !q || (String(c.id || '').includes(q) || (c.statut || '').toLowerCase().includes(q) || (c.lettreMotivation || '').toLowerCase().includes(q))
    );
    this.filtered.sort((a, b) => {
      const ka: any = (this.sortKey === 'id') ? (a.id || 0) : (a as any)[this.sortKey];
      const kb: any = (this.sortKey === 'id') ? (b.id || 0) : (b as any)[this.sortKey];
      if (ka == null && kb == null) return 0; if (ka == null) return -1; if (kb == null) return 1;
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    this.page = 1;
    this.computePage();
  }

  computePage() {
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    const start = (this.page - 1) * this.pageSize;
    this.paged = this.filtered.slice(start, start + this.pageSize);
  }

  goTo(p: number) { this.page = Math.min(Math.max(1, p), this.totalPages); this.computePage(); }

  confirmDelete(c: CandidatureDto) {
    if (!c.id) return;
    this.candidatureToDelete = c;
    this.showDeleteModal();
  }

  editCandidature(c: CandidatureDto) {
    this.candidatureToEdit = { ...c };
    this.showEditModal();
  }

  deleteCandidature(modal: any) {
    if (!this.candidatureToDelete?.id) return;
    
    this.service.delete(this.candidatureToDelete.id).subscribe({
      next: _ => {
        this.toast.show('Candidature supprimée avec succès', 'success');
        this.candidatures = this.candidatures.filter(x => x.id !== this.candidatureToDelete!.id);
        this.applyFilters();
        this.closeModal(modal);
      },
      error: err => {
        console.error('Erreur suppression:', err);
        this.toast.show('Erreur lors de la suppression', 'error');
      }
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

  showEditModal() {
    const modalRef = this.modalService.open(this.editModal, {
      size: 'lg',
      backdrop: false,
      keyboard: true,
      centered: true,
      windowClass: 'modal-no-backdrop'
    });
  }

  updateCandidature(modal: any) {
    if (!this.candidatureToEdit?.id) return;
    
    // Vérifier que la candidature est encore EN_ATTENTE
    if (this.candidatureToEdit.statut !== 'EN_ATTENTE') {
      this.toast.show('Cette candidature ne peut plus être modifiée', 'warning');
      return;
    }
    
    // Ne mettre à jour que la lettre de motivation
    const updateData = {
      lettreMotivation: this.candidatureToEdit.lettreMotivation
    };
    
    this.service.updateFields(this.candidatureToEdit.id, updateData).subscribe({
      next: (updated: any) => {
        this.toast.show('Lettre de motivation mise à jour avec succès', 'success');
        
        // Mettre à jour la candidature dans la liste
        const index = this.candidatures.findIndex(c => c.id === this.candidatureToEdit!.id);
        if (index !== -1) {
          this.candidatures[index] = { ...this.candidatures[index], ...updated };
        }
        
        this.applyFilters();
        this.closeEditModal(modal);
      },
      error: (err: any) => {
        console.error('Erreur mise à jour:', err);
        this.toast.show('Erreur lors de la mise à jour', 'error');
      }
    });
  }

  closeEditModal(modal: any) {
    try {
      modal.dismiss('close');
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
      modal.close();
    }
    this.candidatureToEdit = null;
  }

  closeModal(modal: any) {
    try {
      modal.dismiss('close');
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
      modal.close();
    }
    this.candidatureToDelete = null;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'ACCEPTEE': 'Acceptée',
      'REFUSEE': 'Refusée',
      'RETIREE': 'Retirée'
    };
    return labels[status] || status;
  }
}
