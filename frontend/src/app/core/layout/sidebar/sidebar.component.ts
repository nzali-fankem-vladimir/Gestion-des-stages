import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationStateService } from '../../../shared/services/notification-state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  unread$: Observable<number>;

  constructor(private auth: AuthService, private notifState: NotificationStateService) {
    this.unread$ = this.notifState.unread$;
  }

  get role() {
    return this.auth.role || 'ETUDIANT';
  }
}
