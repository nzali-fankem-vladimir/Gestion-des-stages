import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _messages = new Subject<ToastMessage>();
  messages$ = this._messages.asObservable();

  show(text: string, type: ToastMessage['type'] = 'info') {
    const id = Math.random().toString(36).slice(2);
    this._messages.next({ id, text, type });
  }
}
