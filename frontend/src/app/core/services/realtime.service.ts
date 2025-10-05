import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private client?: Client;
  private connected = false;

  constructor(private zone: NgZone) {}

  connect(): Promise<void> {
    if (this.connected) return Promise.resolve();

    return new Promise((resolve, reject) => {
      try {
        const sock = new SockJS(environment.wsUrl);
        // `@stomp/stompjs` Client can wrap SockJS instance via new Client({webSocketFactory: ...}) but for simplicity use Stomp.over
        // However we use the lightweight Client type interface for typing here.
        // Note: In this repo a simpler WebSocketService exists; this wrapper ensures lazy connect and observables.
        // We keep console-free logging to avoid noisy output.
        // @ts-ignore
        this.client = (window as any).Stomp ? (window as any).Stomp.over(sock) : undefined;
        if (!this.client) {
          // Fallback: use stompjs via dynamic import if available
          // As a safe fallback, resolve without STOMP client to avoid blocking app
          console.warn('STOMP client non disponible');
          resolve();
          return;
        }

        this.client.debug = () => {}; // silence
        this.client.onConnect = () => {
          this.connected = true;
          resolve();
        };
        this.client.onStompError = (err: any) => {
          console.error('STOMP error', err);
        };
        this.client.activate();
      } catch (err) {
        console.error('Erreur connexion realtime:', err);
        reject(err);
      }
    });
  }

  subscribeToNotifications(userId: number): Observable<IMessage> {
    return new Observable<IMessage>(observer => {
      this.connect().then(() => {
        if (!this.client) {
          observer.complete();
          return;
        }
        const sub = this.client.subscribe(`/queue/notifications/${userId}`, (msg: IMessage) => {
          this.zone.run(() => observer.next(msg));
        });
        return () => sub.unsubscribe();
      }).catch(err => observer.error(err));
    });
  }

  subscribeToMessages(userId: number): Observable<IMessage> {
    return new Observable<IMessage>(observer => {
      this.connect().then(() => {
        if (!this.client) {
          observer.complete();
          return;
        }
        const sub = this.client.subscribe(`/queue/messages/${userId}`, (msg: IMessage) => {
          this.zone.run(() => observer.next(msg));
        });
        return () => sub.unsubscribe();
      }).catch(err => observer.error(err));
    });
  }

  disconnect() {
    try {
      // @ts-ignore
      this.client?.deactivate();
      this.connected = false;
    } catch (e) {
      console.warn('Erreur lors de la deconnexion realtime', e);
    }
  }
}
