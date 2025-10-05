import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatureService, CandidatureDto } from '../../core/services/candidature.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-candidature-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="max-w-3xl mx-auto space-y-4">
    <h2 class="text-2xl font-semibold">Nouvelle candidature</h2>
    <form (ngSubmit)="submit()" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm text-gray-600">Offre ID</label>
          <input type="number" class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="offreId" name="offreId" required />
        </div>
        <div>
          <label class="text-sm text-gray-600">Statut (optionnel)</label>
          <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="statut" name="statut" />
        </div>
      </div>
      <div>
        <label class="text-sm text-gray-600">Lettre de motivation (fichier, optionnel)</label>
        <input type="file" class="mt-1 w-full" (change)="onLM($event)" />
      </div>
      <div>
        <label class="text-sm text-gray-600">CV (fichier, optionnel)</label>
        <input type="file" class="mt-1 w-full" (change)="onCV($event)" />
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="border rounded px-4 py-2" (click)="cancel()">Annuler</button>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2">Soumettre</button>
      </div>
    </form>
  </div>
  `
})
export class CandidatureFormPageComponent {
  offreId?: number;
  statut?: string;
  cvFile?: File;
  lmFile?: File;

  constructor(
    private service: CandidatureService,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
    route: ActivatedRoute
  ) {
    const q = route.snapshot.queryParamMap;
    const off = q.get('offreId');
    if (off) this.offreId = Number(off);
  }

  onCV(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.cvFile = input.files[0];
  }

  onLM(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.lmFile = input.files[0];
  }

  submit() {
    const user = this.auth.currentUser;
    if (!user || !this.offreId) { this.toast.show('Formulaire invalide', 'warning'); return; }
    const dto: CandidatureDto = {
      etudiantId: user.id,
      offreId: this.offreId,
      statut: this.statut
    };
    this.service.create(dto, this.cvFile, this.lmFile).subscribe({
      next: _ => {
        this.toast.show('Candidature envoyée', 'success');
        this.router.navigateByUrl('/candidatures');
      },
      error: _ => this.toast.show('Erreur lors de l\'envoi de la candidature', 'error')
    });
  }

  cancel() {
    this.router.navigateByUrl('/candidatures');
  }
}
