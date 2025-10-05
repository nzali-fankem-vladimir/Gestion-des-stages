import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface NotificationDto {
  id?: number;
  utilisateurId: number;
  utilisateurNom?: string;
  type?: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
  actionUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  create(dto: NotificationDto) {
    return this.http.post<NotificationDto>(`${this.base}`, dto);
  }

  getById(id: number) {
    return this.http.get<NotificationDto>(`${this.base}/${id}`);
  }

  getByUser(utilisateurId: number) {
    return this.http.get<NotificationDto[]>(`${this.base}/user/${utilisateurId}`);
  }

  getUnread(utilisateurId: number) {
    return this.http.get<NotificationDto[]>(`${this.base}/user/${utilisateurId}/unread`);
  }

  markAsRead(id: number) {
    return this.http.patch<NotificationDto>(`${this.base}/${id}/read`, {});
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /**
   * Envoie une notification automatique
   */
  sendAutoNotification(data: {
    destinataireEmail?: string;
    destinataireEntreprise?: string;
    titre: string;
    message: string;
    type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
    actionUrl?: string;
  }) {
    console.log('=== ENVOI NOTIFICATION AUTOMATIQUE ===');
    console.log('Données:', data);
    
    return this.http.post(`${this.base}/auto`, data);
  }

  /**
   * Envoie une notification pour validation de convention
   */
  notifyConventionValidation(etudiantEmail: string, entrepriseNom: string, action: 'VALIDEE' | 'REJETEE', reason?: string) {
    const message = action === 'VALIDEE' 
      ? 'Votre convention de stage a été validée par l\'enseignant'
      : `Votre convention de stage a été rejetée${reason ? ': ' + reason : ''}`;

    // Notification à l'étudiant
    this.sendAutoNotification({
      destinataireEmail: etudiantEmail,
      titre: `Convention ${action === 'VALIDEE' ? 'validée' : 'rejetée'}`,
      message: message,
      type: action === 'VALIDEE' ? 'SUCCESS' : 'WARNING'
    }).subscribe({
      next: () => console.log('Notification convention envoyée à l\'étudiant'),
      error: (err) => console.error('Erreur notification étudiant:', err)
    });

    // Notification à l'entreprise
    this.sendAutoNotification({
      destinataireEntreprise: entrepriseNom,
      titre: `Convention ${action === 'VALIDEE' ? 'validée' : 'rejetée'}`,
      message: `La convention de stage a été ${action === 'VALIDEE' ? 'validée' : 'rejetée'} par l'enseignant`,
      type: action === 'VALIDEE' ? 'SUCCESS' : 'WARNING'
    }).subscribe({
      next: () => console.log('Notification convention envoyée à l\'entreprise'),
      error: (err) => console.error('Erreur notification entreprise:', err)
    });
  }

  /**
   * Envoie une notification pour validation de rapport
   */
  notifyRapportValidation(etudiantEmail: string, rapportTitre: string, action: 'VALIDE' | 'REJETE' | 'A_MODIFIER', commentaires?: string) {
    let message = '';
    let type: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS';

    switch (action) {
      case 'VALIDE':
        message = `Votre rapport "${rapportTitre}" a été validé par l'enseignant`;
        type = 'SUCCESS';
        break;
      case 'A_MODIFIER':
        message = `Votre rapport "${rapportTitre}" nécessite des modifications`;
        type = 'WARNING';
        break;
      case 'REJETE':
        message = `Votre rapport "${rapportTitre}" a été rejeté`;
        type = 'ERROR';
        break;
    }

    if (commentaires) {
      message += `: ${commentaires}`;
    }

    this.sendAutoNotification({
      destinataireEmail: etudiantEmail,
      titre: `Rapport ${this.getStatusLabel(action)}`,
      message: message,
      type: type
    }).subscribe({
      next: () => console.log('Notification rapport envoyée à l\'étudiant'),
      error: (err) => console.error('Erreur notification rapport:', err)
    });
  }

  private getStatusLabel(status: string): string {
    const labels = {
      'VALIDE': 'validé',
      'REJETE': 'rejeté',
      'A_MODIFIER': 'à modifier'
    };
    return labels[status as keyof typeof labels] || status;
  }
}
