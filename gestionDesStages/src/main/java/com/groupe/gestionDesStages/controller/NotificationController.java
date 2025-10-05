package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.dto.NotificationDto;
import com.groupe.gestionDesStages.service.serviceImpl.NotificationServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationServiceImpl notificationService;

    /**
     * Crée une nouvelle notification.
     * Cette méthode est principalement pour les usages internes de l'application
     * (par exemple, un administrateur ou un autre service), donc elle est réservée à l'administrateur.
     */
    @PostMapping
    public ResponseEntity<NotificationDto> createNotification(@RequestBody @Valid NotificationDto notificationDto) {
        try {
            NotificationDto createdNotification = notificationService.createNotification(notificationDto);
            return new ResponseEntity<>(createdNotification, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    /**
     * Récupère une notification par son identifiant.
     * Un utilisateur ne devrait pouvoir voir que ses propres notifications.
     * La vérification de l'utilisateur se ferait au niveau du service.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ETUDIANT', 'ENTREPRISE')")
    public ResponseEntity<NotificationDto> findById(@PathVariable Long id) {
        try {
            NotificationDto notification = notificationService.findById(id);
            return ResponseEntity.ok(notification);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère toutes les notifications d'un utilisateur.
     * Le chemin doit correspondre à l'ID de l'utilisateur actuellement authentifié.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDto>> findByUtilisateurId(@PathVariable Long userId) {
        List<NotificationDto> notifications = notificationService.findByUtilisateurId(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Récupère toutes les notifications non lues d'un utilisateur.
     * Le chemin doit correspondre à l'ID de l'utilisateur actuellement authentifié.
     */
    @GetMapping("/user/{userId}/unread")
    @PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationDto>> findByUtilisateurIdAndIsReadFalse(@PathVariable Long userId) {
        List<NotificationDto> unreadNotifications = notificationService.findByUtilisateurIdAndIsReadFalse(userId);
        return ResponseEntity.ok(unreadNotifications);
    }

    /**
     * Marque une notification comme lue.
     * Un utilisateur ne devrait pouvoir marquer que ses propres notifications comme lues.
     * Le service doit s'assurer que l'utilisateur est le propriétaire de la notification.
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ETUDIANT', 'ENTREPRISE')")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        try {
            NotificationDto updatedNotification = notificationService.markAsRead(id);
            return ResponseEntity.ok(updatedNotification);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Supprime une notification par son identifiant.
     * Un utilisateur peut supprimer ses propres notifications.
     * Le service doit s'assurer que l'utilisateur est le propriétaire de la notification.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ETUDIANT', 'ENTREPRISE')")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        try {
            notificationService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }
}
