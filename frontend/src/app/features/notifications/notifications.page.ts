import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationDto } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h2 class="text-2xl font-semibold">Notifications</h2>
    <div class="bg-white border rounded p-4" *ngFor="let n of notifications">
      <div class="flex justify-between items-center">
        <div>
          <div class="font-medium">{{ n.title }}</div>
          <div class="text-sm text-gray-600">{{ n.message }}</div>
        </div>
        <button class="text-sm text-indigo-600 hover:underline" (click)="markAsRead(n)" *ngIf="!n.isRead">Marquer comme lue</button>
      </div>
    </div>
    <div *ngIf="notifications.length === 0" class="text-sm text-gray-500">Aucune notification.</div>
  </div>
  `
})
export class NotificationsPageComponent implements OnInit {
  notifications: NotificationDto[] = [];
  constructor(private service: NotificationService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (!user) return;
    // Charger toutes les notifications de l'utilisateur
    this.service.getByUser(user.id).subscribe((list) => this.notifications = list);
  }

  markAsRead(n: NotificationDto) {
    if (!n.id) return;
    this.service.markAsRead(n.id).subscribe((updated) => {
      const idx = this.notifications.findIndex(x => x.id === n.id);
      if (idx > -1) this.notifications[idx] = updated;
    });
  }
}
