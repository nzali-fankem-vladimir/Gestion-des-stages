import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatureService, CandidatureDto } from '../../core/services/candidature.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-candidature-edit-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="max-w-3xl mx-auto space-y-4" *ngIf="loaded">
    <h2 class="text-2xl font-semibold">Éditer la candidature #{{ id }}</h2>
    <form (ngSubmit)="submit()" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm text-gray-600">Statut</label>
          <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="statut" name="statut" />
        </div>
        <div class="flex items-center gap-2 mt-6 md:mt-0">
          <input id="lu" type="checkbox" [(ngModel)]="luParEntreprise" name="luParEntreprise" class="h-4 w-4" />
          <label for="lu" class="text-sm text-gray-700">Lu par l'entreprise</label>
        </div>
      </div>
      <div>
        <label class="text-sm text-gray-600">Lettre de motivation (nom de fichier)</label>
        <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="lettreMotivation" name="lettreMotivation" />
        <p class="text-xs text-gray-500 mt-1">Ce champ enregistre uniquement le nom du fichier côté backend.</p>
      </div>
      <div>
        <label class="text-sm text-gray-600">Nouveau CV (remplacera l'actuel)</label>
        <input type="file" class="mt-1 w-full" (change)="onCV($event)" />
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="border rounded px-4 py-2" (click)="cancel()">Annuler</button>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2">Enregistrer</button>
      </div>
    </form>
  </div>
  `
})
export class CandidatureEditPageComponent implements OnInit {
  id!: number;
  loaded = false;

  statut?: string;
  lettreMotivation?: string;
  luParEntreprise?: boolean;
  cvFile?: File;

  constructor(
    private route: ActivatedRoute,
    private service: CandidatureService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id) { this.router.navigateByUrl('/candidatures'); return; }
    // Charger la candidature (si besoin d'afficher des valeurs initiales)
    this.service.getById(this.id).subscribe({
      next: (c: CandidatureDto) => {
        this.statut = c.statut;
        this.lettreMotivation = c.lettreMotivation;
        this.luParEntreprise = c.luParEntreprise ?? false;
        this.loaded = true;
      },
      error: _ => { this.toast.show('Candidature introuvable', 'error'); this.router.navigateByUrl('/candidatures'); }
    });
  }

  onCV(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.cvFile = input.files[0];
  }

  submit() {
    const fields: any = {};
    if (this.statut !== undefined) fields.statut = this.statut;
    if (this.lettreMotivation !== undefined) fields.lettreMotivation = this.lettreMotivation;
    if (this.luParEntreprise !== undefined) fields.luParEntreprise = this.luParEntreprise;

    this.service.updateFields(this.id, fields, this.cvFile).subscribe({
      next: _ => { this.toast.show('Candidature mise à jour', 'success'); this.router.navigateByUrl('/candidatures'); },
      error: _ => this.toast.show('Erreur lors de la mise à jour', 'error')
    });
  }

  cancel() { this.router.navigateByUrl('/candidatures'); }
}
