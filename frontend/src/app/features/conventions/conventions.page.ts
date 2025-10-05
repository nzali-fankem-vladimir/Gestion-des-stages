import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConventionService, ConventionDto } from '../../core/services/convention.service';

@Component({
  selector: 'app-conventions-page',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h2 class="text-2xl font-semibold">Conventions</h2>
    <div class="overflow-x-auto bg-white border rounded">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left p-3">#</th>
            <th class="text-left p-3">Titre</th>
            <th class="text-left p-3">Statut</th>
            <th class="text-left p-3">Créée le</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of conventions" class="border-t">
            <td class="p-3">{{ c.id }}</td>
            <td class="p-3">{{ c.titre || '-' }}</td>
            <td class="p-3">{{ c.statut || '-' }}</td>
            <td class="p-3">{{ c.createdAt || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div *ngIf="conventions.length === 0" class="text-sm text-gray-500">Aucune convention.</div>
  </div>
  `
})
export class ConventionsPageComponent implements OnInit {
  conventions: ConventionDto[] = [];
  constructor(private service: ConventionService) {}

  ngOnInit(): void {
    this.service.getAll().subscribe(list => this.conventions = list);
  }
}
