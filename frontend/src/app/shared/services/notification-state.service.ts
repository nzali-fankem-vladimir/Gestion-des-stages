import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationStateService {
  private _unread = new BehaviorSubject<number>(0);
  unread$ = this._unread.asObservable();

  get unread() { return this._unread.value; }

  increment() { this._unread.next(this._unread.value + 1); }
  reset() { this._unread.next(0); }
}
