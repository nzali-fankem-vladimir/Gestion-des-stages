package com.groupe.gestionDesStages.service;

import com.groupe.gestionDesStages.dto.NotificationDto;

import java.util.List;

public interface INotification {
    NotificationDto createNotification(NotificationDto notificationDto);
    NotificationDto findById(Long id);
    List<NotificationDto> findByUtilisateurId(Long utilisateurId);
    List<NotificationDto> findByUtilisateurIdAndIsReadFalse(Long utilisateurId);
    NotificationDto markAsRead(Long id);
    void deleteById(Long id);
}
