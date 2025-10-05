import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OffreService, OffreDto } from '../../core/services/offre.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-offre-edit-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="max-w-3xl mx-auto space-y-4" *ngIf="loaded">
    <h2 class="text-2xl font-semibold">Éditer l'offre #{{ id }}</h2>
    <form (ngSubmit)="submit()" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm text-gray-600">Titre</label>
          <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="model.titre" name="titre" required />
        </div>
        <div>
          <label class="text-sm text-gray-600">Domaine</label>
          <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="model.domaine" name="domaine" />
        </div>
        <div>
          <label class="text-sm text-gray-600">Durée (mois)</label>
          <input type="number" class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="model.duree" name="duree" />
        </div>
        <div>
          <label class="text-sm text-gray-600">Lieu</label>
          <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="model.lieu" name="lieu" />
        </div>
      </div>
      <div>
        <label class="text-sm text-gray-600">Description</label>
        <textarea rows="4" class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="model.description" name="description"></textarea>
      </div>
      <div>
        <label class="text-sm text-gray-600">Nouveau fichier (remplacera l'actuel)</label>
        <input type="file" class="mt-1 w-full" (change)="onFile($event)" />
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="border rounded px-4 py-2" (click)="cancel()">Annuler</button>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2">Enregistrer</button>
      </div>
    </form>
  </div>
  `
})
export class OffreEditPageComponent implements OnInit {
  id!: number;
  loaded = false;
  model: Partial<OffreDto> = {};
  file?: File;

  constructor(
    private route: ActivatedRoute,
    private service: OffreService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id) { this.router.navigateByUrl('/offres'); return; }
    this.service.findById(this.id).subscribe({
      next: (offre) => { this.model = { ...offre }; this.loaded = true; },
      error: _ => { this.toast.show("Offre introuvable", 'error'); this.router.navigateByUrl('/offres'); }
    });
  }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.file = input.files[0];
  }

  submit() {
    this.service.update(this.id, this.model, this.file).subscribe({
      next: _ => { this.toast.show('Offre mise à jour', 'success'); this.router.navigateByUrl('/offres'); },
      error: _ => this.toast.show("Erreur lors de la mise à jour de l'offre", 'error')
    });
  }

  cancel() { this.router.navigateByUrl('/offres'); }
}
