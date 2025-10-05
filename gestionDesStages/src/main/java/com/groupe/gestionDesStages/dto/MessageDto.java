package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.Candidature;
import com.groupe.gestionDesStages.models.Message;
import com.groupe.gestionDesStages.models.Utilisateur;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageDto {

    private Long id;
    private String contenu;
    private LocalDateTime timestamp;
    private boolean lu;
    private Long candidatureId;
    private Long senderId;
    private String senderEmail;
    private Long receiverId;
    private String receiverEmail;


    public static MessageDto fromEntity(Message message) {
        if (message == null) {
            return null;
        }
        return MessageDto.builder()
                .id(message.getId())
                .contenu(message.getContenu())
                .timestamp(message.getTimestamp())
                .lu(message.isLu())
                .candidatureId(message.getCandidature() != null ? message.getCandidature().getId() : null)
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .senderEmail(message.getSender() != null ? message.getSender().getEmail() : null)
                .receiverId(message.getReceiver() != null ? message.getReceiver().getId() : null)
                .receiverEmail(message.getReceiver() != null ? message.getReceiver().getEmail() : null)
                .build();
    }


    public static Message toEntity(MessageDto messageDto, Candidature candidature, Utilisateur sender, Utilisateur receiver) {
        if (messageDto == null) {
            return null;
        }
        return Message.builder()
                .id(messageDto.getId())
                .contenu(messageDto.getContenu())
                .timestamp(messageDto.getTimestamp())
                .lu(messageDto.isLu())
                .candidature(candidature)
                .sender(sender)
                .receiver(receiver)
                .build();
    }
}
