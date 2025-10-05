package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.dto.MessageDto;
import com.groupe.gestionDesStages.service.serviceImpl.MessageServiceImpl;
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
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageServiceImpl messageService;

    /**
     * Crée un nouveau message.
     * Accessible aux étudiants, entreprises et administrateurs.
     * Le service doit vérifier que l'expéditeur est l'utilisateur actuellement authentifié.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ETUDIANT') or hasAuthority('ENTREPRISE') or hasAuthority('ENSEIGNANT')")
    public ResponseEntity<MessageDto> createMessage(@RequestBody @Valid MessageDto messageDto) {
        try {
            MessageDto createdMessage = messageService.createMessage(messageDto);
            return new ResponseEntity<>(createdMessage, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    /**
     * Récupère un message par son identifiant.
     * Accessible aux étudiants, entreprises et administrateurs.
     * Le service doit s'assurer que l'utilisateur est bien l'expéditeur ou le destinataire du message.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ETUDIANT') or hasAuthority('ENTREPRISE') or hasAuthority('ENSEIGNANT')")
    public ResponseEntity<MessageDto> findById(@PathVariable Long id) {
        try {
            MessageDto message = messageService.findById(id);
            return ResponseEntity.ok(message);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère tous les messages d'une candidature.
     * Accessible aux étudiants, entreprises et administrateurs.
     * L'utilisateur doit être lié à la candidature pour y avoir accès.
     */
    @GetMapping("/candidature/{candidatureId}")
    @PreAuthorize("hasAuthority('ETUDIANT') or hasAuthority('ENTREPRISE') or hasAuthority('ENSEIGNANT')")
    public ResponseEntity<List<MessageDto>> findByCandidatureId(@PathVariable Long candidatureId) {
        List<MessageDto> messages = messageService.findByCandidatureId(candidatureId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Récupère tous les messages envoyés par ou reçus par un utilisateur.
     * L'ID dans le chemin doit correspondre à l'ID de l'utilisateur actuellement authentifié.
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('ETUDIANT') or hasAuthority('ENTREPRISE') or hasAuthority('ENSEIGNANT')")
    public ResponseEntity<List<MessageDto>> findBySenderIdOrReceiverId(@PathVariable Long userId) {
        List<MessageDto> messages = messageService.findBySenderIdOrReceiverId(userId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Récupère les conversations d'un enseignant.
     * Retourne une liste vide si aucune conversation n'existe.
     */
    @GetMapping("/conversations/{userId}")
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    public ResponseEntity<List<MessageDto>> getConversations(@PathVariable Long userId) {
        try {
            List<MessageDto> messages = messageService.findBySenderIdOrReceiverId(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            // Retourner une liste vide au lieu d'une erreur
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Supprime un message par son identifiant.
     * Accessible aux étudiants, entreprises et administrateurs.
     * L'utilisateur doit être l'expéditeur du message ou un administrateur pour le supprimer.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ETUDIANT') or hasAuthority('ENTREPRISE') or hasAuthority('ENSEIGNANT')")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        try {
            messageService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }
}
