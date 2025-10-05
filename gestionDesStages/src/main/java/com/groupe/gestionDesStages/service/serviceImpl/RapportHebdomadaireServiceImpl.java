package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.RapportHebdomadaireDto;
import com.groupe.gestionDesStages.models.Offre;
import com.groupe.gestionDesStages.models.RapportHebdomadaire;
import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.repository.OffreRepository;
import com.groupe.gestionDesStages.repository.RapportHebdomadaireRepository;
import com.groupe.gestionDesStages.repository.UtilisateurRepository;
import com.groupe.gestionDesStages.service.IRapportHebdomadaireService;
import com.groupe.gestionDesStages.validator.ObjectValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RapportHebdomadaireServiceImpl implements IRapportHebdomadaireService {

    private final RapportHebdomadaireRepository rapportHebdomadaireRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final OffreRepository offreRepository;
    private final ObjectValidator<RapportHebdomadaireDto> validator;

    // ✍️ AJOUT : dossier de stockage des fichiers
    private final Path root = Paths.get("uploads/rapports");

    // ✍️ AJOUT : méthode utilitaire de sauvegarde fichier
    private String saveFile(MultipartFile file) {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = this.root.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return filename; // on retourne juste le nom
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier : " + e.getMessage());
        }
    }

    // ========================= CREATION =========================
    @Override
    @Transactional
    public RapportHebdomadaireDto createRapport(RapportHebdomadaireDto dto, MultipartFile file) {
        validator.validate(dto);

        Utilisateur etudiant = utilisateurRepository.findById(dto.getEtudiantId())
                .orElseThrow(() -> new EntityNotFoundException("Étudiant introuvable avec id : " + dto.getEtudiantId()));

        Offre stage = offreRepository.findById(dto.getOffreId())
                .orElseThrow(() -> new EntityNotFoundException("Offre de stage introuvable avec id : " + dto.getOffreId()));

        Utilisateur enseignant = dto.getEnseignantDestinataireId() != null
                ? utilisateurRepository.findById(dto.getEnseignantDestinataireId()).orElse(null)
                : null;

        RapportHebdomadaire rapport = dto.toEntity(etudiant, stage, enseignant);

        // ✍️ Gestion du fichier uploadé
        if (file != null && !file.isEmpty()) {
            String filename = saveFile(file);
            rapport.setFichierUrl("/files/rapports/" + filename);
            rapport.setNomFichier(file.getOriginalFilename());
            rapport.setTypeFichier(file.getContentType());
        }

        RapportHebdomadaire saved = rapportHebdomadaireRepository.save(rapport);
        return RapportHebdomadaireDto.fromEntity(saved);
    }

    // ========================= UPDATE =========================
    @Override
    @Transactional
    public RapportHebdomadaireDto updateRapport(Long id, RapportHebdomadaireDto dto, MultipartFile file) {
        validator.validate(dto);

        RapportHebdomadaire rapport = rapportHebdomadaireRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rapport non trouvé avec id " + id));

        // Mise à jour des champs texte
        rapport.setSemaineNumero(dto.getSemaineNumero());
        rapport.setDateDebutSemaine(dto.getDateDebutSemaine());
        rapport.setDateFinSemaine(dto.getDateFinSemaine());
        rapport.setActivitesRealisees(dto.getActivitesRealisees());
        rapport.setCompetencesAcquises(dto.getCompetencesAcquises());
        rapport.setDifficultes(dto.getDifficultes());
        rapport.setObjectifsSemaineSuivante(dto.getObjectifsSemaineSuivante());
        rapport.setStatut(dto.getStatut() != null ? RapportHebdomadaire.StatutRapport.valueOf(dto.getStatut()) : rapport.getStatut());
        rapport.setUpdatedAt(LocalDateTime.now());

        // ✍️ Gestion du nouveau fichier si fourni
        if (file != null && !file.isEmpty()) {
            String filename = saveFile(file);
            rapport.setFichierUrl("/files/rapports/" + filename);
            rapport.setNomFichier(file.getOriginalFilename());
            rapport.setTypeFichier(file.getContentType());
        }

        RapportHebdomadaire updated = rapportHebdomadaireRepository.save(rapport);
        return RapportHebdomadaireDto.fromEntity(updated);
    }

    // ========================= FINDERS =========================
    @Override
    public RapportHebdomadaire findEntityById(Long id) {
        return rapportHebdomadaireRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rapport non trouvé avec id " + id));
    }

    @Override
    public RapportHebdomadaireDto findById(Long id) {
        return rapportHebdomadaireRepository.findById(id)
                .map(RapportHebdomadaireDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Rapport hebdomadaire introuvable avec id : " + id));
    }

    @Override
    public List<RapportHebdomadaireDto> findAll() {
        return rapportHebdomadaireRepository.findAll()
                .stream()
                .map(RapportHebdomadaireDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<RapportHebdomadaireDto> findByEtudiantId(Long etudiantId) {
        return rapportHebdomadaireRepository.findByEtudiantId(etudiantId)
                .stream()
                .map(RapportHebdomadaireDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<RapportHebdomadaireDto> findByOffreId(Long offreId) {
        return rapportHebdomadaireRepository.findByStageId(offreId)
                .stream()
                .map(RapportHebdomadaireDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<RapportHebdomadaireDto> findRapportsByEtudiantIdSorted(Long etudiantId) {
        return rapportHebdomadaireRepository.findByEtudiantIdOrderBySemaineNumeroAsc(etudiantId)
                .stream()
                .map(RapportHebdomadaireDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<RapportHebdomadaireDto> findRapportsByOffreIdSorted(Long offreId) {
        return rapportHebdomadaireRepository.findByStageIdOrderBySemaineNumeroAsc(offreId)
                .stream()
                .map(RapportHebdomadaireDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<RapportHebdomadaireDto> findRapportsByEtudiantIdAndOffreIdSorted(Long etudiantId, Long offreId) {
        return rapportHebdomadaireRepository.findByEtudiantIdAndStageIdOrderBySemaineNumeroAsc(etudiantId, offreId)
                .stream()
                .map(RapportHebdomadaireDto::fromEntity)
                .collect(Collectors.toList());
    }

    // ========================= SOUMISSION / VALIDATION =========================
    @Override
    @Transactional
    public RapportHebdomadaireDto submitRapport(Long id, String statut, Long enseignantId) {
        RapportHebdomadaire rapport = rapportHebdomadaireRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rapport hebdomadaire introuvable avec id : " + id));

        Utilisateur enseignant = utilisateurRepository.findById(enseignantId)
                .orElseThrow(() -> new EntityNotFoundException("Enseignant introuvable avec id : " + enseignantId));

        rapport.setStatut(RapportHebdomadaire.StatutRapport.valueOf(statut));
        rapport.setEnseignantDestinataire(enseignant);
        rapport.setDateSoumission(LocalDateTime.now());
        rapport.setUpdatedAt(LocalDateTime.now());

        RapportHebdomadaire updatedRapport = rapportHebdomadaireRepository.save(rapport);
        return RapportHebdomadaireDto.fromEntity(updatedRapport);
    }

    @Override
    @Transactional
    public RapportHebdomadaireDto validateRapport(Long id, String commentaires) {
        RapportHebdomadaire rapport = rapportHebdomadaireRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rapport hebdomadaire introuvable avec id : " + id));

        rapport.setStatut(RapportHebdomadaire.StatutRapport.VALIDE);
        rapport.setCommentairesEnseignant(commentaires);
        rapport.setUpdatedAt(LocalDateTime.now());

        return RapportHebdomadaireDto.fromEntity(rapportHebdomadaireRepository.save(rapport));
    }

    @Override
    @Transactional
    public RapportHebdomadaireDto requestModification(Long id, String commentaires) {
        RapportHebdomadaire rapport = rapportHebdomadaireRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rapport hebdomadaire introuvable avec id : " + id));

        rapport.setStatut(RapportHebdomadaire.StatutRapport.BROUILLON);
        rapport.setCommentairesEnseignant(commentaires);
        rapport.setUpdatedAt(LocalDateTime.now());

        return RapportHebdomadaireDto.fromEntity(rapportHebdomadaireRepository.save(rapport));
    }

    @Override
    @Transactional
    public RapportHebdomadaireDto rejectRapport(Long id, String reason) {
        RapportHebdomadaire rapport = rapportHebdomadaireRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rapport hebdomadaire introuvable avec id : " + id));

        rapport.setStatut(RapportHebdomadaire.StatutRapport.REJETE);
        rapport.setCommentairesEnseignant(reason);
        rapport.setUpdatedAt(LocalDateTime.now());

        return RapportHebdomadaireDto.fromEntity(rapportHebdomadaireRepository.save(rapport));
    }

    // ========================= DELETE =========================
    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!rapportHebdomadaireRepository.existsById(id)) {
            throw new EntityNotFoundException("Rapport hebdomadaire introuvable avec id : " + id);
        }
        rapportHebdomadaireRepository.deleteById(id);
    }

    // ========================= FIND BY ENSEIGNANT =========================
    @Override
    public List<RapportHebdomadaireDto> findRapportsByEnseignant(Long enseignantId) {
        return rapportHebdomadaireRepository.findAll()
                .stream()
                .filter(r -> r.getEnseignantDestinataire() != null && r.getEnseignantDestinataire().getId().equals(enseignantId))
                .map(RapportHebdomadaireDto::fromEntity)
                .collect(Collectors.toList());
    }
}
