import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-etudiant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold">Tableau de bord étudiant</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Carte des candidatures -->
        <div class="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 class="text-lg font-medium mb-4">Mes candidatures</h2>
          <p class="text-gray-600 mb-4">Gérez vos candidatures en cours et passées</p>
          <a routerLink="/candidatures" class="text-indigo-600 hover:underline inline-flex items-center">
            Voir mes candidatures
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <!-- Carte des conventions -->
        <div class="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 class="text-lg font-medium mb-4">Mes conventions</h2>
          <p class="text-gray-600 mb-4">Accédez à vos conventions de stage</p>
          <a routerLink="/conventions" class="text-indigo-600 hover:underline inline-flex items-center">
            Voir mes conventions
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <!-- Carte des rapports -->
        <div class="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 class="text-lg font-medium mb-4">Mes rapports</h2>
          <p class="text-gray-600 mb-4">Déposez et consultez vos rapports de stage</p>
          <a routerLink="/rapports" class="text-indigo-600 hover:underline inline-flex items-center">
            Voir mes rapports
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class EtudiantDashboardPageComponent {}
