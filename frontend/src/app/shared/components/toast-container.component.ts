import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../services/toast.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div *ngFor="let t of toasts" class="px-4 py-3 rounded shadow text-white"
           [ngClass]="{
             'bg-blue-600': t.type === 'info',
             'bg-green-600': t.type === 'success',
             'bg-yellow-600': t.type === 'warning',
             'bg-red-600': t.type === 'error'
           }">
        {{ t.text }}
      </div>
    </div>
  `
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  sub?: Subscription;

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toast.messages$.subscribe(m => {
      this.toasts.push(m);
      const ttl = 4000;
      const id = m.id;
      timer(ttl).subscribe(() => {
        this.toasts = this.toasts.filter(x => x.id !== id);
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
