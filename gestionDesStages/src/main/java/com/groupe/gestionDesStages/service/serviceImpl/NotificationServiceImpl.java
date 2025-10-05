package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.NotificationDto;
import com.groupe.gestionDesStages.models.Notification;
import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.repository.NotificationRepository;
import com.groupe.gestionDesStages.repository.UtilisateurRepository;
import com.groupe.gestionDesStages.service.INotification;
import com.groupe.gestionDesStages.validator.ObjectValidator;
import com.groupe.gestionDesStages.websocket.WebSocketService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements INotification {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ObjectValidator<NotificationDto> validator;
    private final WebSocketService webSocketService;

    @Override
    @Transactional
    public NotificationDto createNotification(NotificationDto notificationDto) {
        // Validation
        validator.validate(notificationDto);

        Utilisateur utilisateur = utilisateurRepository.findById(notificationDto.getUtilisateurId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Utilisateur introuvable avec l'id : " + notificationDto.getUtilisateurId()));

        Notification notification = NotificationDto.toEntity(notificationDto, utilisateur);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification savedNotification = notificationRepository.save(notification);
        NotificationDto payload = NotificationDto.fromEntity(savedNotification);
        // Temps réel: pousser la notification au client de l'utilisateur ciblé
        try {
            webSocketService.sendNotificationToUser(payload.getUtilisateurId(), payload);
        } catch (Exception ignored) {
            // Ne pas impacter la transaction en cas d'erreur websocket
        }
        return payload;
    }

    @Override
    public NotificationDto findById(Long id) {
        return notificationRepository.findById(id)
                .map(NotificationDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Notification introuvable avec l'id : " + id));
    }

    @Override
    public List<NotificationDto> findByUtilisateurId(Long utilisateurId) {
        return notificationRepository.findByUtilisateurId(utilisateurId)
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationDto> findByUtilisateurIdAndIsReadFalse(Long utilisateurId) {
        return notificationRepository.findByUtilisateurIdAndIsReadFalse(utilisateurId)
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationDto markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification introuvable avec l'id : " + id));

        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return NotificationDto.fromEntity(updatedNotification);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new EntityNotFoundException("Notification introuvable avec l'id : " + id);
        }
        notificationRepository.deleteById(id);
    }
}
