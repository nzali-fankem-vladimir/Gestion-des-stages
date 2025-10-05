package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.Notification;
import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.models.enums.Type;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDto {

    private Long id;
    private Long utilisateurId;
    private String utilisateurNom;
    private String type;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String actionUrl;


    public static NotificationDto fromEntity(Notification notification) {
        if (notification == null) {
            return null;
        }

        return NotificationDto.builder()
                .id(notification.getId())
                .utilisateurId(notification.getUtilisateur() != null ? notification.getUtilisateur().getId() : null)
                .utilisateurNom(notification.getUtilisateur() != null ? notification.getUtilisateur().getEmail() : null)
                .type(notification.getType() != null ? notification.getType().name() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .actionUrl(notification.getActionUrl())
                .build();
    }


    public static Notification toEntity(NotificationDto notificationDto, Utilisateur utilisateur) {
        if (notificationDto == null) {
            return null;
        }
        return Notification.builder()
                .id(notificationDto.getId())
                .utilisateur(utilisateur)
                .type(notificationDto.getType() != null ? Type.valueOf(notificationDto.getType()) : null)
                .title(notificationDto.getTitle())
                .message(notificationDto.getMessage())
                .isRead(notificationDto.getIsRead())
                .createdAt(notificationDto.getCreatedAt())
                .actionUrl(notificationDto.getActionUrl())
                .build();
    }
}
