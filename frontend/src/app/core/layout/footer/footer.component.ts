import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-50 border-t px-6 py-4">
      <div class="flex justify-between items-center text-sm text-gray-600">
        <div>
          © 2024 Gestion Des Stages - Tous droits réservés
        </div>
        <div class="flex items-center gap-4">
          <span>Version 1.0.0</span>
          <span>•</span>
          <a href="#" class="hover:text-indigo-600">Support</a>
          <span>•</span>
          <a href="#" class="hover:text-indigo-600">Documentation</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
}
