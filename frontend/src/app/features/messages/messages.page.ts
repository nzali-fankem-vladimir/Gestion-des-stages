import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService, MessageDto } from '../../core/services/message.service';
import { ProfileImageService } from '../../core/services/profile-image.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { WebSocketService } from '../../core/services/websocket.service';

interface Conversation {
  id: string;
  nom: string;
  type: 'ENTREPRISE' | 'ENSEIGNANT' | 'ADMIN';
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline?: boolean;
}

interface Message {
  id: string;
  contenu: string;
  expediteur: {
    id: number;
    nom: string;
    avatar?: string;
  };
  destinataire: {
    id: number;
    nom: string;
  };
  timestamp: Date;
  isOwn: boolean;
  status: 'ENVOYE' | 'RECU' | 'LU';
}

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styles: [
    `
    .conversation-item:hover {
      background-color: #f8fafc;
    }
    
    .conversation-item.active {
      background-color: #e0e7ff;
      border-left: 4px solid #6366f1;
    }
    
    .message-bubble {
      max-width: 70%;
      word-wrap: break-word;
    }
    
    .message-bubble.own {
      background-color: #6366f1;
      color: white;
      margin-left: auto;
    }
    
    .message-bubble.other {
      background-color: #f3f4f6;
      color: #374151;
    }
    
    .messages-container {
      height: 500px;
      overflow-y: auto;
    }
    
    .messages-container::-webkit-scrollbar {
      width: 6px;
    }
    
    .messages-container::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    .messages-container::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .typing-dot {
      width: 6px;
      height: 6px;
      background-color: #9ca3af;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typing {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
    
    /* Focus des champs de saisie dans les modals */
    :host ::ng-deep select:focus,
    :host ::ng-deep textarea:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    `
  ],
  template: `
    <div class="h-full flex bg-white border rounded-lg overflow-hidden">
      <!-- Liste des conversations -->
      <div class="w-1/3 border-r bg-gray-50">
        <!-- En-tête conversations -->
        <div class="p-4 border-b bg-white">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-semibold text-gray-900">Messages</h2>
            <button 
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              (click)="startNewConversation()"
              title="Nouvelle conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          </div>
          
          <!-- Recherche -->
          <div class="relative">
            <input 
              type="text" 
              placeholder="Rechercher une conversation..."
              class="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [(ngModel)]="searchQuery"
              (input)="filterConversations()"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>

        <!-- Liste des conversations -->
        <div class="overflow-y-auto h-full">
          <div 
            *ngFor="let conv of filteredConversations" 
            class="conversation-item p-4 border-b cursor-pointer transition-colors"
            [class.active]="selectedConversation?.id === conv.id"
            (click)="selectConversation(conv)"
          >
            <div class="flex items-center space-x-3">
              <!-- Avatar -->
              <div class="relative">
                <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">{{ getInitials(conv.nom) }}</span>
                </div>
                <div 
                  *ngIf="conv.isOnline" 
                  class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
                ></div>
              </div>
              
              <!-- Contenu conversation -->
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                  <h3 class="text-sm font-medium text-gray-900 truncate">{{ conv.nom }}</h3>
                  <span class="text-xs text-gray-500">{{ formatTime(conv.lastMessageTime) }}</span>
                </div>
                
                <div class="flex justify-between items-center mt-1">
                  <p class="text-sm text-gray-600 truncate">{{ conv.lastMessage || 'Aucun message' }}</p>
                  <span 
                    *ngIf="conv.unreadCount > 0" 
                    class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-blue-600 text-white text-xs"
                  >
                    {{ conv.unreadCount }}
                  </span>
                </div>
                
                <div class="flex items-center mt-1">
                  <span class="inline-flex px-2 py-0.5 text-xs rounded-full" 
                        [ngClass]="getTypeBadgeClass(conv.type)">
                    {{ getTypeLabel(conv.type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- État vide -->
          <div *ngIf="filteredConversations.length === 0" class="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-gray-400 mx-auto mb-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.96 2.193-.34.027-.68.052-1.021.072-1.963.116-3.93.168-5.928.168-2.538 0-4.948-.094-7.209-.32-.32-.032-.64-.066-.96-.102A2.25 2.25 0 013 14.25V9.75c0-.969.616-1.813 1.5-2.097C6.462 7.087 8.708 6.75 12 6.75s5.538.337 7.5.903z" />
            </svg>
            <p class="text-gray-500">Aucune conversation trouvée</p>
          </div>
        </div>
      </div>

      <!-- Zone de conversation -->
      <div class="flex-1 flex flex-col">
        <!-- En-tête conversation active -->
        <div *ngIf="selectedConversation" class="p-4 border-b bg-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">{{ getInitials(selectedConversation.nom) }}</span>
                </div>
                <div 
                  *ngIf="selectedConversation.isOnline" 
                  class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border border-white rounded-full"
                ></div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ selectedConversation.nom }}</h3>
                <p class="text-xs text-gray-500">
                  {{ selectedConversation.isOnline ? 'En ligne' : 'Hors ligne' }} • {{ getTypeLabel(selectedConversation.type) }}
                </p>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div *ngIf="selectedConversation" class="flex-1 messages-container p-4 space-y-4" #messagesContainer>
          <div *ngFor="let message of currentMessages" class="flex" [class.justify-end]="message.isOwn">
            <div class="message-bubble p-3 rounded-lg" [class.own]="message.isOwn" [class.other]="!message.isOwn">
              <div class="text-sm">{{ message.contenu }}</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs opacity-75">{{ formatMessageTime(message.timestamp) }}</span>
                <div *ngIf="message.isOwn" class="flex items-center space-x-1">
                  <svg *ngIf="message.status === 'ENVOYE'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 opacity-75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <svg *ngIf="message.status === 'RECU'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 opacity-75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <svg *ngIf="message.status === 'LU'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 text-blue-400">
                    <path d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Indicateur de frappe -->
          <div *ngIf="isTyping" class="flex">
            <div class="message-bubble other p-3 rounded-lg">
              <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Zone de saisie -->
        <div *ngIf="selectedConversation" class="p-4 border-t bg-white">
          <div class="flex items-end space-x-3">
            <button class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>
            
            <div class="flex-1">
              <textarea 
                [(ngModel)]="newMessage"
                (keydown)="onKeyDown($event)"
                (input)="onTyping()"
                placeholder="Tapez votre message..."
                class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="1"
                #messageInput
              ></textarea>
            </div>
            
            <button 
              (click)="sendMessage()"
              [disabled]="!newMessage.trim() || isSending"
              class="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg *ngIf="!isSending" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              <div *ngIf="isSending" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </div>

        <!-- État vide -->
        <div *ngIf="!selectedConversation" class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-gray-400 mx-auto mb-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
            <p class="text-gray-500">Choisissez une conversation dans la liste pour commencer à échanger</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal nouvelle conversation -->
    <ng-template #newConversationModal let-modal>
      <div class="modal-header" style="background: #4f46e5 !important; color: white !important; padding: 1.5rem 2rem !important; position: relative !important;">
        <h4 style="color: white !important; font-size: 1.5rem !important; font-weight: 600 !important; margin: 0 !important;">Nouvelle conversation</h4>
        <button type="button" 
                style="position: absolute !important; top: 1.5rem !important; right: 2rem !important; color: white !important; background: none !important; border: none !important; font-size: 24px !important; cursor: pointer !important; opacity: 0.8 !important;"
                (click)="closeModal(modal)">
          ×
        </button>
      </div>
      <div class="modal-body p-6">
        <form [formGroup]="conversationForm" (ngSubmit)="createConversation(modal)">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Destinataire</label>
              <select formControlName="destinataireId" 
                      style="width: 100% !important; padding: 12px 16px !important; border: 2px solid #d1d5db !important; border-radius: 8px !important; font-size: 14px !important; background: white !important; color: #374151 !important;">
                <option value="">Sélectionner un destinataire</option>
                <option *ngFor="let destinataire of getAvailableDestinataires()" [value]="destinataire.id">
                  {{ destinataire.type }} - {{ destinataire.nom }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Premier message</label>
              <textarea 
                formControlName="message" 
                rows="4" 
                style="width: 100% !important; padding: 12px 16px !important; border: 2px solid #d1d5db !important; border-radius: 8px !important; font-size: 14px !important; line-height: 1.5 !important; background: white !important; color: #374151 !important; transition: all 0.2s ease !important; box-sizing: border-box !important; resize: vertical !important; min-height: 120px !important; font-family: inherit !important;"
                placeholder="Tapez votre message...">
              </textarea>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer bg-gray-50 px-6 py-4 flex justify-end gap-4">
        <button 
          style="background: #9ca3af !important; color: white !important; border: 1px solid #9ca3af !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 100px !important;"
          (click)="closeModal(modal)">
          Annuler
        </button>
        <button 
          style="background: #6366f1 !important; color: white !important; border: 1px solid #6366f1 !important; padding: 12px 24px !important; border-radius: 8px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; min-width: 100px !important;"
          [disabled]="!conversationForm.valid"
          (click)="createConversation(modal)">
          Envoyer
        </button>
      </div>
    </ng-template>
  `
})
export class MessagesPageComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChild('newConversationModal') newConversationModal!: TemplateRef<any>;

  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  currentMessages: Message[] = [];
  
  newMessage = '';
  searchQuery = '';
  isSending = false;
  isTyping = false;
  
  conversationForm: FormGroup;
  
  private typingTimeout: any;
  private shouldScrollToBottom = false;

  constructor(
    private messageService: MessageService, 
    private authService: AuthService,
    private toast: ToastService,
    private websocketService: WebSocketService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private profileImageService: ProfileImageService
  ) {
    this.conversationForm = this.fb.group({
      destinataireId: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadConversations();
    this.setupWebSocketListeners();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadConversations() {
    const user = this.authService.currentUser;
    console.log('=== LOAD CONVERSATIONS DEBUG ===');
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user found, showing empty state');
      this.conversations = [];
      this.filteredConversations = [];
      return;
    }

    console.log('Calling API with userId:', user.id, 'and role:', user.role);
    
    // Utiliser l'endpoint approprié selon le rôle
    const messagesObservable = user.role === 'ENSEIGNANT' 
      ? this.messageService.getConversationsForTeacher(user.id)
      : this.messageService.getForUser(user.id);
    
    // Charger les messages depuis l'API et créer les conversations
    messagesObservable.subscribe({
      next: (messages: any[]) => {
        console.log('API messages response:', messages);
        console.log('Number of messages:', messages.length);
        
        if (messages.length === 0) {
          console.log('No messages found, showing empty state');
          this.conversations = [];
          this.filteredConversations = [];
        } else {
          // Créer des conversations à partir des messages
          // Normalize avatar URLs in messages
          messages.forEach(m => {
            if (m.expediteur && m.expediteur.avatarUrl && !m.expediteur.avatarUrl.startsWith('http') && !m.expediteur.avatarUrl.startsWith('/files/')) {
              try { m.expediteur.avatarUrl = this.profileImageService.buildImageUrl(m.expediteur.avatarUrl); } catch(e) { console.warn(e); }
            }
            if (m.destinataire && m.destinataire.avatarUrl && !m.destinataire.avatarUrl.startsWith('http') && !m.destinataire.avatarUrl.startsWith('/files/')) {
              try { m.destinataire.avatarUrl = this.profileImageService.buildImageUrl(m.destinataire.avatarUrl); } catch(e) { console.warn(e); }
            }
          });

          this.conversations = this.createConversationsFromMessages(messages, user.id);
          this.filteredConversations = [...this.conversations];
        }
        console.log('Final conversations:', this.conversations);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des conversations:', err);
        console.log('Error status:', err.status);
        console.log('Error message:', err.message);
        console.log('Error details:', err.error);
        
        // Gestion gracieuse des erreurs - pas de toast pour les erreurs 500/403/404
        this.conversations = [];
        this.filteredConversations = [];
        
        if (err.status === 500) {
          console.log('Erreur serveur 500 - probablement aucune conversation existante');
        } else if (err.status === 403) {
          console.log('Accès non autorisé - vérifier les permissions');
        } else {
          this.toast.show('Impossible de charger les conversations', 'error');
        }
      }
    });
  }

  private loadTestConversations() {
    this.conversations = [
      {
        id: '1',
        nom: 'TechCorp Solutions',
        type: 'ENTREPRISE',
        lastMessage: 'Merci pour votre candidature, nous reviendrons vers vous bientôt.',
        lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
        unreadCount: 2,
        isOnline: true
      },
      {
        id: '2',
        nom: 'Prof. Martin Dubois',
        type: 'ENSEIGNANT',
        lastMessage: 'N\'oubliez pas de rendre votre rapport avant vendredi.',
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 0,
        isOnline: false
      }
    ];
    this.filteredConversations = [...this.conversations];
  }

  private createConversationsFromMessages(messages: any[], currentUserId: number): Conversation[] {
    // Grouper les messages par interlocuteur
    const conversationMap = new Map<number, any>();
    
    messages.forEach(message => {
      // Déterminer l'interlocuteur (celui qui n'est pas l'utilisateur actuel)
      const isFromCurrentUser = message.senderId === currentUserId || message.expediteurId === currentUserId;
      const interlocuteurId = isFromCurrentUser 
        ? (message.receiverId || message.destinataireId)
        : (message.senderId || message.expediteurId);
      
      const interlocuteur = isFromCurrentUser 
        ? message.destinataire 
        : message.expediteur;
      
      if (!conversationMap.has(interlocuteurId)) {
        conversationMap.set(interlocuteurId, {
          id: interlocuteurId,
          nom: interlocuteur?.fullName || interlocuteur?.nom || `Utilisateur ${interlocuteurId}`,
          type: this.getUserType(interlocuteur?.role),
          lastMessage: message.contenu,
          lastMessageTime: new Date(message.createdAt),
          unreadCount: 0, // TODO: Calculer les messages non lus
          isOnline: false // TODO: Implémenter le statut en ligne
        });
      } else {
        // Mettre à jour avec le message le plus récent
        const existing = conversationMap.get(interlocuteurId);
        const existingTime = new Date(existing.lastMessageTime);
        const messageTime = new Date(message.createdAt);
        
        if (messageTime > existingTime) {
          existing.lastMessage = message.contenu;
          existing.lastMessageTime = messageTime;
        }
      }
    });
    
    // Convertir en array et trier par date du dernier message
    return Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }

  private mapConversations(apiConversations: any[]): Conversation[] {
    return apiConversations.map(conv => ({
      id: conv.id.toString(),
      nom: conv.destinataire?.fullName || conv.expediteur?.fullName || 'Utilisateur',
      type: this.getUserType(conv.destinataire?.role || conv.expediteur?.role),
      lastMessage: conv.lastMessage?.contenu || '',
      lastMessageTime: conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt) : undefined,
      unreadCount: conv.unreadCount || 0,
      isOnline: Math.random() > 0.5 // TODO: Implémenter le statut en ligne réel
    }));
  }

  private getUserType(role: string): 'ENTREPRISE' | 'ENSEIGNANT' | 'ADMIN' {
    switch (role) {
      case 'ENTREPRISE': return 'ENTREPRISE';
      case 'ENSEIGNANT': return 'ENSEIGNANT';
      case 'ADMIN': return 'ADMIN';
      default: return 'ENSEIGNANT';
    }
  }

  setupWebSocketListeners() {
    // TODO: Implémenter les listeners WebSocket
    // this.websocketService.onMessage().subscribe(message => {
    //   this.handleNewMessage(message);
    // });
  }

  filterConversations() {
    if (!this.searchQuery.trim()) {
      this.filteredConversations = [...this.conversations];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredConversations = this.conversations.filter(conv =>
      conv.nom.toLowerCase().includes(query) ||
      conv.lastMessage?.toLowerCase().includes(query)
    );
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
    
    // Marquer comme lu
    conversation.unreadCount = 0;
  }

  loadMessages(conversationId: string) {
    const user = this.authService.currentUser;
    if (!user) return;

    // Charger les messages depuis l'API
    this.messageService.getForUser(user.id).subscribe({
      next: (messages) => {
        this.currentMessages = this.mapMessages(messages, user.id);
        this.shouldScrollToBottom = true;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des messages:', err);
        this.toast.show('Erreur lors du chargement des messages', 'error');
        
        // Fallback avec messages de test
        this.loadTestMessages();
      }
    });
  }

  private loadTestMessages() {
    const user = this.authService.currentUser;
    this.currentMessages = [
      {
        id: '1',
        contenu: 'Bonjour, j\'aimerais postuler pour le stage de développement.',
        expediteur: { id: user?.id || 1, nom: 'Vous' },
        destinataire: { id: 2, nom: 'TechCorp' },
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        isOwn: true,
        status: 'LU'
      },
      {
        id: '2',
        contenu: 'Bonjour ! Merci pour votre intérêt. Pouvez-vous nous envoyer votre CV ?',
        expediteur: { id: 2, nom: 'TechCorp' },
        destinataire: { id: user?.id || 1, nom: 'Vous' },
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        isOwn: false,
        status: 'RECU'
      }
    ];
    this.shouldScrollToBottom = true;
  }

  private mapMessages(apiMessages: any[], currentUserId: number): Message[] {
    return apiMessages.map(msg => ({
      id: msg.id.toString(),
      contenu: msg.contenu || '',
      expediteur: {
        id: msg.expediteur?.id || 0,
        nom: msg.expediteur?.fullName || 'Utilisateur',
        avatar: msg.expediteur?.avatarUrl
      },
      destinataire: {
        id: msg.destinataire?.id || 0,
        nom: msg.destinataire?.fullName || 'Utilisateur'
      },
      timestamp: new Date(msg.createdAt || Date.now()),
      isOwn: msg.expediteur?.id === currentUserId,
      status: this.getMessageStatus(msg.statut)
    }));
  }

  private getMessageStatus(apiStatus: string): 'ENVOYE' | 'RECU' | 'LU' {
    switch (apiStatus) {
      case 'SENT': return 'ENVOYE';
      case 'DELIVERED': return 'RECU';
      case 'READ': return 'LU';
      default: return 'ENVOYE';
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation || this.isSending) {
      return;
    }

    this.isSending = true;
    const user = this.authService.currentUser;
    if (!user) return;

    const messageData: any = {
      contenu: this.newMessage.trim(),
      senderId: user.id,
      receiverId: parseInt(this.selectedConversation.id), // TODO: Récupérer le vrai ID du destinataire
      expediteurId: user.id,
      destinataireId: parseInt(this.selectedConversation.id),
      conversationId: this.selectedConversation.id,
      candidatureId: 1 // TODO: Récupérer le vrai ID de candidature si applicable
    };

    // Envoyer via l'API réelle
    this.messageService.create(messageData).subscribe({
      next: (response: any) => {
        const newMessage: Message = {
          id: response.id?.toString() || Date.now().toString(),
          contenu: messageData.contenu,
          expediteur: { id: user.id, nom: user.fullName || 'Vous' },
          destinataire: { id: messageData.destinataireId, nom: this.selectedConversation!.nom },
          timestamp: new Date(response.createdAt || Date.now()),
          isOwn: true,
          status: 'ENVOYE'
        };

        this.currentMessages.push(newMessage);
        this.selectedConversation!.lastMessage = newMessage.contenu;
        this.selectedConversation!.lastMessageTime = newMessage.timestamp;
        
        this.newMessage = '';
        this.isSending = false;
        this.shouldScrollToBottom = true;
        
        this.toast.show('Message envoyé', 'success');
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'envoi du message:', err);
        this.toast.show('Erreur lors de l\'envoi du message', 'error');
        
        // Fallback : simulation locale en cas d'erreur API
        this.sendMessageFallback();
      }
    });
  }

  private sendMessageFallback() {
    const user = this.authService.currentUser;
    const message: Message = {
      id: Date.now().toString(),
      contenu: this.newMessage.trim(),
      expediteur: { id: user?.id || 0, nom: user?.fullName || 'Vous' },
      destinataire: { id: 0, nom: this.selectedConversation!.nom },
      timestamp: new Date(),
      isOwn: true,
      status: 'ENVOYE'
    };

    this.currentMessages.push(message);
    this.selectedConversation!.lastMessage = message.contenu;
    this.selectedConversation!.lastMessageTime = message.timestamp;
    
    this.newMessage = '';
    this.isSending = false;
    this.shouldScrollToBottom = true;
    
    this.toast.show('Message envoyé (mode hors ligne)', 'success');
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onTyping() {
    // TODO: Envoyer indicateur de frappe via WebSocket
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      // Arrêter l'indicateur de frappe
    }, 1000);
  }

  startNewConversation() {
    console.log('=== START NEW CONVERSATION DEBUG ===');
    console.log('Opening new conversation modal...');
    this.conversationForm.reset();
    this.modalService.open(this.newConversationModal, { 
      size: 'md', 
      backdrop: false 
    });
  }

  createConversation(modal: any) {
    console.log('=== CREATE CONVERSATION DEBUG ===');
    console.log('Form valid:', this.conversationForm.valid);
    console.log('Form value:', this.conversationForm.value);
    
    if (!this.conversationForm.valid) {
      this.toast.show('Veuillez remplir tous les champs', 'error');
      return;
    }

    const user = this.authService.currentUser;
    if (!user) {
      this.toast.show('Utilisateur non connecté', 'error');
      return;
    }

    const formValue = this.conversationForm.value;
    const messageData: MessageDto = {
      contenu: formValue.message,
      senderId: user.id,
      receiverId: parseInt(formValue.destinataireId),
      expediteurId: user.id,
      destinataireId: parseInt(formValue.destinataireId),
      candidatureId: 1 // TODO: Gérer les candidatures si nécessaire
    };

    console.log('Sending message:', messageData);

    this.messageService.create(messageData).subscribe({
      next: (response) => {
        console.log('Message sent successfully:', response);
        this.toast.show('Conversation créée avec succès', 'success');
        this.closeModal(modal);
        this.loadConversations(); // Recharger les conversations
      },
      error: (err) => {
        console.error('Error creating conversation:', err);
        this.toast.show('Erreur lors de la création de la conversation', 'error');
      }
    });
  }

  closeModal(modal: any) {
    modal.dismiss();
  }

  scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Erreur lors du scroll:', err);
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'ENTREPRISE': 'Entreprise',
      'ENSEIGNANT': 'Enseignant',
      'ADMIN': 'Administration'
    };
    return labels[type] || type;
  }

  getTypeBadgeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'ENTREPRISE': 'bg-blue-100 text-blue-800',
      'ENSEIGNANT': 'bg-green-100 text-green-800',
      'ADMIN': 'bg-purple-100 text-purple-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  }

  getAvailableDestinataires(): Array<{id: string, type: string, nom: string}> {
    // L'enseignant ne peut contacter que l'étudiant et l'entreprise du stage qu'il supervise
    // TODO: Récupérer les vraies données depuis le backend basées sur les stages supervisés
    // Pour l'instant, on retourne des données d'exemple basées sur l'utilisateur connecté
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser?.role === 'ENSEIGNANT') {
      // Pour un enseignant, on retourne les étudiants et entreprises de ses stages
      return [
        { id: '1', type: 'Étudiant', nom: 'Hugo Grant' },
        { id: '2', type: 'Entreprise', nom: 'TechCorp' }
      ];
    }
    
    // Pour les autres rôles, retourner une liste vide pour l'instant
    return [];
  }
}
