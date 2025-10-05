import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-enseignant-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h2 class="text-2xl font-semibold">Tableau de bord Enseignant</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="bg-white border rounded-lg p-4">
        <div class="text-sm text-gray-500">Conventions à valider</div>
        <div class="text-3xl font-semibold mt-2">--</div>
      </div>
      <div class="bg-white border rounded-lg p-4">
        <div class="text-sm text-gray-500">Rapports à relire</div>
        <div class="text-3xl font-semibold mt-2">--</div>
      </div>
      <div class="bg-white border rounded-lg p-4">
        <div class="text-sm text-gray-500">Nouveaux messages</div>
        <div class="text-3xl font-semibold mt-2">--</div>
      </div>
      <div class="bg-white border rounded-lg p-4">
        <div class="text-sm text-gray-500">Notifications</div>
        <div class="text-3xl font-semibold mt-2">--</div>
      </div>
    </div>
  </div>
  `
})
export class EnseignantDashboardPageComponent {}
