import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(private auth: AuthService) {}

  get user() {
    return this.auth.currentUser;
  }

  get role() {
    return this.auth.role || 'ETUDIANT';
  }

  get isAdmin() {
    return this.role === 'ADMIN';
  }

  get welcomeMessage() {
    if (this.isAdmin) {
      return 'Bienvenue Administrateur';
    }
    return `Bienvenue ${this.user?.fullName || 'Utilisateur'}`;
  }
}
