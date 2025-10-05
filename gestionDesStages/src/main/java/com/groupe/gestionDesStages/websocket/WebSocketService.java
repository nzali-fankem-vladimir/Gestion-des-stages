package com.groupe.gestionDesStages.websocket;

import com.groupe.gestionDesStages.dto.MessageDto;
import com.groupe.gestionDesStages.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotificationToUser(Long userId, NotificationDto notification) {
        messagingTemplate.convertAndSend("/queue/notifications/" + userId, notification);
    }

    public void sendMessageToUser(Long userId, MessageDto message) {
        messagingTemplate.convertAndSend("/queue/messages/" + userId, message);
    }

    public void broadcastInternshipUpdate(String message) {
        messagingTemplate.convertAndSend("/topic/internships", message);
    }
}
