import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="min-h-screen grid grid-rows-[64px,1fr,auto] grid-cols-1">
      <!-- Header -->
      <app-header class="row-start-1 col-span-1"></app-header>

      <div class="row-start-2 col-span-1 grid grid-cols-[260px,1fr]">
        <!-- Sidebar -->
        <app-sidebar class="h-full border-r bg-white"></app-sidebar>

        <!-- Main content -->
        <main class="p-6">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Footer -->
      <app-footer class="row-start-3 col-span-1"></app-footer>
    </div>
  `
})
export class AuthenticatedLayoutComponent {}
