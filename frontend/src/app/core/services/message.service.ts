import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface MessageDto {
  id?: number;
  contenu?: string;
  createdAt?: string;
  candidatureId?: number;
  senderId: number;
  receiverId: number;
  expediteurId?: number;
  destinataireId?: number;
  conversationId?: string;
  statut?: string;
  expediteur?: {
    id: number;
    fullName: string;
    avatarUrl?: string;
    role?: string;
  };
  destinataire?: {
    id: number;
    fullName: string;
    role?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private base = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  create(message: MessageDto) {
    return this.http.post<MessageDto>(`${this.base}`, message);
  }

  getById(id: number) {
    return this.http.get<MessageDto>(`${this.base}/${id}`);
  }

  getByCandidature(candidatureId: number) {
    return this.http.get<MessageDto[]>(`${this.base}/candidature/${candidatureId}`);
  }

  getForUser(userId: number) {
    return this.http.get<MessageDto[]>(`${this.base}/user/${userId}`);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getConversations(userId: number) {
    return this.http.get<any[]>(`${this.base}/conversations/${userId}`);
  }

  getConversationsForTeacher(userId: number) {
    return this.http.get<MessageDto[]>(`${this.base}/conversations/${userId}`);
  }

  getConversationMessages(conversationId: string) {
    return this.http.get<MessageDto[]>(`${this.base}/conversation/${conversationId}`);
  }

  markAsRead(messageId: number) {
    return this.http.put<void>(`${this.base}/${messageId}/read`, {});
  }
}
