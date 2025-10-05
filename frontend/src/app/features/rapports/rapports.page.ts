import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RapportService, RapportHebdomadaireDto } from '../../core/services/rapport.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-rapports-page',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h2 class="text-2xl font-semibold">Mes rapports hebdomadaires</h2>
    <div class="overflow-x-auto bg-white border rounded">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left p-3">#</th>
            <th class="text-left p-3">Titre</th>
            <th class="text-left p-3">Créé le</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rapports" class="border-t">
            <td class="p-3">{{ r.id }}</td>
            <td class="p-3">{{ r.titre || '-' }}</td>
            <td class="p-3">{{ r.createdAt || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div *ngIf="rapports.length === 0" class="text-sm text-gray-500">Aucun rapport.</div>
  </div>
  `
})
export class RapportsPageComponent implements OnInit {
  rapports: RapportHebdomadaireDto[] = [];
  constructor(private service: RapportService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (!user) return;
    this.service.getByEtudiant(user.id).subscribe(list => this.rapports = list);
  }
}
