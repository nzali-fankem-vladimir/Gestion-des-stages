import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationStateService } from '../../../shared/services/notification-state.service';
import { ProfileImageService } from '../../services/profile-image.service';
import { Observable } from 'rxjs';
import { RealtimeService } from '../../services/realtime.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  unread$: Observable<number>;
  profileImageUrl: string | null = null;

  constructor(
    private auth: AuthService, 
    private notifState: NotificationStateService, 
    private router: Router,
    private profileImageService: ProfileImageService
    , private realtime: RealtimeService
  ) {
    this.unread$ = this.notifState.unread$;
  }

  ngOnInit() {
    // S'abonner aux changements de photo de profil
    this.profileImageService.profileImage$.subscribe(imageUrl => {
      this.profileImageUrl = imageUrl;
      console.log('Header: Photo de profil mise à jour:', imageUrl);
    });

    // Charger la photo de profil au démarrage si un utilisateur est connecté
    if (this.isLoggedIn) {
      console.log('Header: Chargement de la photo de profil au démarrage');
      this.profileImageService.loadProfileImage();
    }

    // Connecter le canal realtime et s'abonner aux notifications/messages
    const user = this.auth.currentUser;
    if (user && user.id) {
      this.realtime.connect().then(() => {
        try {
          this.realtime.subscribeToNotifications(user.id).subscribe(msg => {
            console.log('Notification realtime reçue:', msg.body || msg);
            // Incrémenter le compteur local d'unread (le service peut être rechargé par UI si besoin)
            try { this.notifState.increment(); } catch (e) { console.warn('Unable to increment notif state', e); }
          });

          this.realtime.subscribeToMessages(user.id).subscribe(msg => {
            console.log('Message realtime reçu:', msg.body || msg);
            // Possibilité: déclencher une actualisation des conversations
            // Nous n'avons pas de service central pour les messages, recharger via event
          });
        } catch (e) {
          console.warn('Impossible de s\'abonner aux canaux realtime:', e);
        }
      }).catch(err => console.warn('Realtime connect failed:', err));
    }
  }

  get isLoggedIn() { 
    return !!this.auth.currentUser; 
  }

  get userName() { 
    return this.auth.currentUser?.fullName || this.auth.currentUser?.email || 'Utilisateur'; 
  }
  
  get userRole() { 
    const role = this.auth.currentUser?.role;
    switch(role) {
      case 'ETUDIANT': return 'Étudiant';
      case 'ENSEIGNANT': return 'Enseignant';
      case 'ENTREPRISE': return 'Entreprise';
      case 'ADMIN': return 'Administrateur';
      default: return 'Utilisateur';
    }
  }
  
  get userAvatar() { 
    // Utiliser d'abord l'image du service, puis celle du auth, puis le fallback
    return this.profileImageUrl || this.auth.currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userName)}&background=6366f1&color=fff`;
  }

  onLogout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
