package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.MessageDto;
import com.groupe.gestionDesStages.dto.NotificationDto;
import com.groupe.gestionDesStages.models.Candidature;
import com.groupe.gestionDesStages.models.Message;
import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.models.Etudiant;
import com.groupe.gestionDesStages.models.Enseignant;
import com.groupe.gestionDesStages.models.Entreprise;
import com.groupe.gestionDesStages.repository.CandidatureRepository;
import com.groupe.gestionDesStages.repository.MessageRepository;
import com.groupe.gestionDesStages.repository.UtilisateurRepository;
import com.groupe.gestionDesStages.service.IMessageService;
import com.groupe.gestionDesStages.validator.ObjectValidator;
import com.groupe.gestionDesStages.websocket.WebSocketService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements IMessageService {

    private final MessageRepository messageRepository;
    private final CandidatureRepository candidatureRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ObjectValidator<MessageDto> validator;
    private final WebSocketService webSocketService;

    @Override
    @Transactional
    public MessageDto createMessage(MessageDto messageDto) {
        validator.validate(messageDto);

        // Candidature peut être null pour les messages généraux (enseignants)
        Candidature candidature = null;
        if (messageDto.getCandidatureId() != null) {
            candidature = candidatureRepository.findById(messageDto.getCandidatureId())
                    .orElseThrow(() -> new EntityNotFoundException("Candidature introuvable avec l'id : " + messageDto.getCandidatureId()));
        }

        Utilisateur sender = utilisateurRepository.findById(messageDto.getSenderId())
                .orElseThrow(() -> new EntityNotFoundException("Expéditeur introuvable avec l'id : " + messageDto.getSenderId()));

        Utilisateur receiver = utilisateurRepository.findById(messageDto.getReceiverId())
                .orElseThrow(() -> new EntityNotFoundException("Destinataire introuvable avec l'id : " + messageDto.getReceiverId()));

        Message message = MessageDto.toEntity(messageDto, candidature, sender, receiver);
        Message savedMessage = messageRepository.save(message);
        
        // Temps réel: notifier le destinataire du nouveau message
        MessageDto payload = MessageDto.fromEntity(savedMessage);
        try {
            webSocketService.sendMessageToUser(payload.getReceiverId(), payload);
        } catch (Exception ignored) {
            // On ignore les erreurs websocket pour ne pas impacter la transaction principale
        }

        // Créer une notification persistante pour le destinataire
        try {
            // Obtenir le nom de l'expéditeur selon son type
            String senderName = getSenderName(sender);
            
            NotificationDto notification = NotificationDto.builder()
                    .utilisateurId(receiver.getId())
                    .type("MESSAGE")
                    .title("Nouveau message")
                    .message("Vous avez reçu un nouveau message de " + senderName)
                    .isRead(false)
                    .build();
            
            // Envoyer aussi la notification via WebSocket
            webSocketService.sendNotificationToUser(receiver.getId(), notification);
        } catch (Exception e) {
            // On ignore les erreurs de notification pour ne pas impacter la transaction principale
            System.err.println("Erreur lors de la création de la notification: " + e.getMessage());
        }

        // Optionnel: pousser aussi une notification légère en temps réel (sans persistance ici)
        try {
            NotificationDto notif = new NotificationDto();
            notif.setUtilisateurId(payload.getReceiverId());
            notif.setTitle("Nouveau message");
            notif.setMessage("Vous avez reçu un nouveau message");
            webSocketService.sendNotificationToUser(payload.getReceiverId(), notif);
        } catch (Exception ignored) {
        }

        return payload;
    }

    @Override
    public MessageDto findById(Long id) {
        return messageRepository.findById(id)
                .map(MessageDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Message introuvable avec l'id : " + id));
    }

    @Override
    public List<MessageDto> findByCandidatureId(Long candidatureId) {
        return messageRepository.findByCandidatureId(candidatureId)
                .stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDto> findBySenderIdOrReceiverId(Long userId) {
        return messageRepository.findBySenderIdOrReceiverId(userId, userId)
                .stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!messageRepository.existsById(id)) {
            throw new EntityNotFoundException("Message introuvable avec l'id : " + id);
        }
        messageRepository.deleteById(id);
    }

    /**
     * Obtient le nom complet de l'expéditeur selon son type
     */
    private String getSenderName(Utilisateur sender) {
        if (sender instanceof Etudiant) {
            Etudiant etudiant = (Etudiant) sender;
            return etudiant.getPrenom() + " " + etudiant.getNom();
        } else if (sender instanceof Enseignant) {
            Enseignant enseignant = (Enseignant) sender;
            return enseignant.getPrenom() + " " + enseignant.getNom();
        } else if (sender instanceof Entreprise) {
            Entreprise entreprise = (Entreprise) sender;
            return entreprise.getNom(); // Les entreprises n'ont qu'un nom
        } else {
            // Fallback pour les autres types d'utilisateurs
            return sender.getEmail();
        }
    }
}
