import { Component, OnInit, ViewChild, TemplateRef, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/auth.service';
import { MessageService, MessageDto } from '../../core/services/message.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { ToastService } from '../../shared/services/toast.service';

interface Conversation {
  id: string;
  nom: string;
  type: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline?: boolean;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  senderName: string;
  senderAvatar?: string;
}

@Component({
  selector: 'app-etudiant-messages',
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
    
    /* Focus des champs de saisie */
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
          </div>
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="filterConversations()"
              placeholder="Rechercher une conversation..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- Liste des conversations -->
        <div class="overflow-y-auto" style="height: calc(100vh - 200px);">
          <div *ngFor="let conversation of filteredConversations" 
               class="conversation-item p-4 border-b cursor-pointer transition-colors"
               [class.active]="selectedConversation?.id === conversation.id"
               (click)="selectConversation(conversation)">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {{ getInitials(conversation.nom) }}
                </div>
                <div *ngIf="conversation.isOnline" class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-900 truncate">{{ conversation.nom }}</h3>
                  <span class="text-xs text-gray-500">{{ formatTime(conversation.lastMessageTime) }}</span>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <p class="text-sm text-gray-600 truncate">{{ conversation.lastMessage || 'Aucun message' }}</p>
                  <span *ngIf="conversation.unreadCount > 0" 
                        class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {{ conversation.unreadCount }}
                  </span>
                </div>
                <div class="flex items-center mt-1">
                  <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                        [ngClass]="getTypeBadgeClass(conversation.type)">
                    {{ getTypeLabel(conversation.type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="filteredConversations.length === 0" class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune conversation</h3>
            <p class="mt-1 text-sm text-gray-500">Vous n'avez pas encore de conversations</p>
          </div>
        </div>
      </div>

      <!-- Zone de conversation -->
      <div class="flex-1 flex flex-col">
        <div *ngIf="!selectedConversation" class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
            <p class="text-gray-500">Choisissez une conversation dans la liste pour commencer à échanger</p>
          </div>
        </div>

        <div *ngIf="selectedConversation" class="flex-1 flex flex-col">
          <!-- En-tête conversation -->
          <div class="p-4 border-b bg-white">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {{ getInitials(selectedConversation.nom) }}
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ selectedConversation.nom }}</h3>
                <p class="text-sm text-gray-500">{{ getTypeLabel(selectedConversation.type) }}</p>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 messages-container p-4 space-y-4" #messagesContainer>
            <div *ngFor="let message of currentMessages" class="flex" [class.justify-end]="message.isOwn">
              <div class="message-bubble rounded-lg px-4 py-2" [class.own]="message.isOwn" [class.other]="!message.isOwn">
                <p class="text-sm">{{ message.content }}</p>
                <p class="text-xs mt-1 opacity-70">{{ formatMessageTime(message.timestamp) }}</p>
              </div>
            </div>

            <div *ngIf="currentMessages.length === 0" class="text-center py-8">
              <p class="text-gray-500">Aucun message dans cette conversation</p>
            </div>
          </div>

          <!-- Zone de saisie -->
          <div class="p-4 border-t bg-white">
            <div class="flex space-x-2">
              <textarea
                [(ngModel)]="newMessage"
                (keydown)="onKeyDown($event)"
                placeholder="Tapez votre message..."
                class="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="1"
                #messageInput
              ></textarea>
              <button
                (click)="sendMessage()"
                [disabled]="!newMessage.trim() || isSending"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg *ngIf="!isSending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                <svg *ngIf="isSending" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EtudiantMessagesPageComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  currentMessages: Message[] = [];
  
  newMessage = '';
  searchQuery = '';
  isSending = false;

  conversationForm: FormGroup;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private webSocketService: WebSocketService,
    private toast: ToastService,
    private fb: FormBuilder,
    private modal: NgbModal
  ) {
    this.conversationForm = this.fb.group({
      destinataireId: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadConversations();
    this.connectWebSocket();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private connectWebSocket() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.webSocketService.connect().then(() => {
      // Écouter les nouveaux messages
      this.webSocketService.subscribe(`/queue/messages/${user.id}`, (message) => {
        const messageData = JSON.parse(message.body);
        this.handleNewMessage(messageData);
      });

      // Écouter les notifications
      this.webSocketService.subscribe(`/queue/notifications/${user.id}`, (notification) => {
        const notificationData = JSON.parse(notification.body);
        this.handleNewNotification(notificationData);
      });
    });
  }

  private handleNewMessage(messageData: any) {
    console.log('Nouveau message reçu:', messageData);
    
    // Actualiser les conversations
    this.loadConversations();
    
    // Si c'est la conversation active, ajouter le message
    if (this.selectedConversation) {
      this.loadMessagesForConversation(this.selectedConversation.id);
    }
    
    this.toast.show('Nouveau message reçu', 'info');
  }

  private handleNewNotification(notificationData: any) {
    console.log('Nouvelle notification reçue:', notificationData);
    
    if (notificationData.type === 'MESSAGE') {
      this.toast.show(notificationData.title, 'info');
    }
  }

  loadConversations() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.conversations = [];
      this.filteredConversations = [];
      return;
    }

    this.messageService.getForUser(user.id).subscribe({
      next: (messages: MessageDto[]) => {
        if (messages.length === 0) {
          this.conversations = [];
          this.filteredConversations = [];
        } else {
          this.conversations = this.createConversationsFromMessages(messages, user.id);
          this.filteredConversations = [...this.conversations];
        }
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des conversations:', err);
        this.conversations = [];
        this.filteredConversations = [];
      }
    });
  }

  private createConversationsFromMessages(messages: MessageDto[], currentUserId: number): Conversation[] {
    const conversationMap = new Map<string, Conversation>();

    messages.forEach(message => {
      const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
      const otherUserEmail = message.senderId === currentUserId ? 
        (message.destinataire?.fullName || 'Utilisateur inconnu') : 
        (message.expediteur?.fullName || 'Utilisateur inconnu');
      
      const conversationId = `${Math.min(currentUserId, otherUserId!)}-${Math.max(currentUserId, otherUserId!)}`;
      
      if (!conversationMap.has(conversationId)) {
        conversationMap.set(conversationId, {
          id: conversationId,
          nom: otherUserEmail || 'Utilisateur inconnu',
          type: 'ENSEIGNANT', // Pour un étudiant, les messages viennent généralement des enseignants
          lastMessage: message.contenu,
          lastMessageTime: new Date(message.createdAt!),
          unreadCount: 0, // Pas de système de lecture pour l'instant
          isOnline: false
        });
      } else {
        const conversation = conversationMap.get(conversationId)!;
        if (new Date(message.createdAt!) > conversation.lastMessageTime!) {
          conversation.lastMessage = message.contenu;
          conversation.lastMessageTime = new Date(message.createdAt!);
        }
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) => 
      (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0)
    );
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.loadMessagesForConversation(conversation.id);
  }

  private loadMessagesForConversation(conversationId: string) {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.messageService.getForUser(user.id).subscribe({
      next: (messages: MessageDto[]) => {
        const conversationMessages = messages.filter(message => {
          const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
          const expectedConversationId = `${Math.min(user.id, otherUserId!)}-${Math.max(user.id, otherUserId!)}`;
          return expectedConversationId === conversationId;
        });

        this.currentMessages = conversationMessages.map(message => ({
          id: message.id!.toString(),
          content: message.contenu!,
          timestamp: new Date(message.createdAt!),
          isOwn: message.senderId === user.id,
          senderName: message.senderId === user.id ? 'Vous' : (message.expediteur?.fullName || 'Inconnu')
        })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      },
      error: (err) => {
        console.error('Erreur lors du chargement des messages:', err);
        this.currentMessages = [];
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isSending = true;

    // Extraire l'ID du destinataire depuis l'ID de conversation
    const [userId1, userId2] = this.selectedConversation.id.split('-').map(Number);
    const receiverId = userId1 === user.id ? userId2 : userId1;

    const messageDto: MessageDto = {
      contenu: this.newMessage.trim(),
      senderId: user.id,
      receiverId: receiverId
    };

    this.messageService.create(messageDto).subscribe({
      next: (response) => {
        console.log('Message envoyé:', response);
        
        // Ajouter le message à la liste locale
        this.currentMessages.push({
          id: response.id!.toString(),
          content: response.contenu!,
          timestamp: new Date(response.createdAt!),
          isOwn: true,
          senderName: 'Vous'
        });

        // Vider le champ de saisie
        this.newMessage = '';
        this.isSending = false;

        // Actualiser les conversations
        this.loadConversations();
        
        this.toast.show('Message envoyé', 'success');
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi du message:', err);
        this.isSending = false;
        this.toast.show('Erreur lors de l\'envoi du message', 'error');
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  filterConversations() {
    if (!this.searchQuery.trim()) {
      this.filteredConversations = [...this.conversations];
    } else {
      this.filteredConversations = this.conversations.filter(conv =>
        conv.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
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
}
