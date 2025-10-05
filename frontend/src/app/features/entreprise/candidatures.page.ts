import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidatureService, CandidatureDto } from '../../core/services/candidature.service';
import { OffreService, OffreDto } from '../../core/services/offre.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-entreprise-candidatures-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <h2 class="text-2xl font-semibold">Candidatures reçues</h2>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Offre</label>
        <select [(ngModel)]="selectedOffreId" name="offre" class="border rounded px-3 py-2" (change)="loadCandidatures()">
          <option [ngValue]="null">Toutes les offres</option>
          <option *ngFor="let o of offres" [ngValue]="o.id">{{ o.titre || ('Offre #' + o.id) }}</option>
        </select>
        <input class="border rounded px-3 py-2 text-sm" [(ngModel)]="q" name="q" placeholder="Rechercher..." (input)="applyFilters()" />
        <select class="border rounded px-3 py-2 text-sm" [(ngModel)]="sortKey" name="sortKey" (change)="applyFilters()">
          <option value="id">#</option>
          <option value="statut">Statut</option>
          <option value="luParEntreprise">Lu</option>
        </select>
        <select class="border rounded px-3 py-2 text-sm" [(ngModel)]="pageSize" name="pageSize" (change)="applyFilters()">
          <option [ngValue]="5">5</option>
          <option [ngValue]="10">10</option>
          <option [ngValue]="20">20</option>
        </select>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-3 py-2 text-sm" (click)="refresh()">Actualiser</button>
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
            <th class="text-left p-3">Lu</th>
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
                <button class="text-indigo-600 hover:underline" (click)="markRead(c)" *ngIf="!c.luParEntreprise">Marquer lu</button>
                <button class="text-gray-700 hover:underline" (click)="toggleLu(c)" *ngIf="c.luParEntreprise">Marquer non lu</button>
                <button class="text-amber-600 hover:underline" (click)="promptStatut(c)">Changer statut</button>
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
  `
})
export class EntrepriseCandidaturesPageComponent implements OnInit {
  offres: OffreDto[] = [];
  candidatures: CandidatureDto[] = [];
  filtered: CandidatureDto[] = [];
  paged: CandidatureDto[] = [];
  selectedOffreId: number | null = null;
  q = '';
  sortKey: 'id' | 'statut' | 'luParEntreprise' = 'id';
  page = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private candidatureService: CandidatureService, private offreService: OffreService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.offreService.findAll().subscribe(list => {
      this.offres = list;
      this.loadCandidatures();
    });
  }

  loadCandidatures() {
    if (this.selectedOffreId) {
      this.candidatureService.getByOffre(this.selectedOffreId).subscribe(list => { this.candidatures = list; this.applyFilters(); });
    } else {
      // Pas d'endpoint pour toutes les candidatures d'une entreprise, on agrège celles de chaque offre
      const all: CandidatureDto[] = [];
      let remaining = this.offres.length;
      if (remaining === 0) {
        this.candidatures = [];
        return;
      }
      this.offres.forEach(o => {
        if (!o.id) { remaining--; return; }
        this.candidatureService.getByOffre(o.id).subscribe(list => {
          all.push(...list);
          remaining--;
          if (remaining === 0) { this.candidatures = all; this.applyFilters(); }
        }, _ => { remaining--; if (remaining === 0) { this.candidatures = all; this.applyFilters(); } });
      });
    }
  }

  applyFilters() {
    const q = this.q.toLowerCase().trim();
    this.filtered = this.candidatures.filter(c =>
      !q || (String(c.id||'').includes(q) || (c.statut||'').toLowerCase().includes(q) || (c.lettreMotivation||'').toLowerCase().includes(q))
    );
    this.filtered.sort((a,b)=>{
      const ka:any = this.sortKey==='id' ? (a.id||0) : (a as any)[this.sortKey];
      const kb:any = this.sortKey==='id' ? (b.id||0) : (b as any)[this.sortKey];
      if (ka==null && kb==null) return 0; if (ka==null) return -1; if (kb==null) return 1; return ka<kb?-1:ka>kb?1:0;
    });
    this.page = 1;
    this.computePage();
  }

  computePage(){
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    const start = (this.page - 1) * this.pageSize;
    this.paged = this.filtered.slice(start, start + this.pageSize);
  }

  goTo(p:number){ this.page = Math.min(Math.max(1,p), this.totalPages); this.computePage(); }

  markRead(c: CandidatureDto){
    if (!c.id) return;
    this.candidatureService.updateFields(c.id, { luParEntreprise: true }).subscribe({
      next: (res) => { c.luParEntreprise = true; this.toast.show('Marqué comme lu', 'success'); this.applyFilters(); },
      error: _ => this.toast.show('Erreur lors de la mise à jour', 'error')
    });
  }

  toggleLu(c: CandidatureDto){
    if (!c.id) return;
    this.candidatureService.updateFields(c.id, { luParEntreprise: !c.luParEntreprise }).subscribe({
      next: (res) => { c.luParEntreprise = !c.luParEntreprise; this.toast.show('Mise à jour effectuée', 'success'); this.applyFilters(); },
      error: _ => this.toast.show('Erreur lors de la mise à jour', 'error')
    });
  }

  promptStatut(c: CandidatureDto){
    if (!c.id) return;
    const val = prompt('Nouveau statut', c.statut || '');
    if (val === null) return;
    this.candidatureService.updateFields(c.id, { statut: val }).subscribe({
      next: _ => { c.statut = val; this.toast.show('Statut mis à jour', 'success'); this.applyFilters(); },
      error: _ => this.toast.show('Erreur lors de la mise à jour', 'error')
    });
  }
}
