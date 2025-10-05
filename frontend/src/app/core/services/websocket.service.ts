import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client?: Client;
  private connected = false;

  constructor(private zone: NgZone) {}

  connect(): Promise<void> {
    if (this.connected) return Promise.resolve();

    return new Promise((resolve) => {
      const sock = new SockJS(environment.wsUrl);
      this.client = Stomp.over(sock);
      // Optional: disable noisy logs
      this.client.debug = () => {};

      this.client.onConnect = () => {
        this.connected = true;
        resolve();
      };
      this.client.onStompError = () => {
        // keep silent; implement retry if needed
      };
      this.client.activate();
    });
  }

  subscribe(destination: string, handler: (message: IMessage) => void) {
    if (!this.client) return;
    return this.client.subscribe(destination, (msg) => {
      // run change detection
      this.zone.run(() => handler(msg));
    });
  }

  disconnect() {
    this.client?.deactivate();
    this.connected = false;
  }
}
