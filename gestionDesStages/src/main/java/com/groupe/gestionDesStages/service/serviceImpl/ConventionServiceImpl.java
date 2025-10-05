package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.ConventionDto;
import com.groupe.gestionDesStages.models.*;
import com.groupe.gestionDesStages.models.enums.StatutConvention;
import com.groupe.gestionDesStages.repository.*;
import com.groupe.gestionDesStages.service.IConventionService;
import com.groupe.gestionDesStages.validator.ObjectValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConventionServiceImpl implements IConventionService {

    private final ConventionRepository conventionRepository;
    private final EtudiantRepository etudiantRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final EnseignantRepository enseignantRepository;
    private final OffreRepository offreRepository;
    private final CandidatureRepository candidatureRepository;
    private final ObjectValidator<ConventionDto> validator;

    @Override
    @Transactional
    public ConventionDto createConvention(ConventionDto conventionDto) {
        // Validation du DTO
        validator.validate(conventionDto);

        Etudiant etudiant = etudiantRepository.findById(conventionDto.getEtudiantId())
                .orElseThrow(() -> new EntityNotFoundException("Étudiant introuvable avec id : " + conventionDto.getEtudiantId()));

        Entreprise entreprise = entrepriseRepository.findById(conventionDto.getEntrepriseId())
                .orElseThrow(() -> new EntityNotFoundException("Entreprise introuvable avec id : " + conventionDto.getEntrepriseId()));

        Offre offre = offreRepository.findById(conventionDto.getOffreId())
                .orElseThrow(() -> new EntityNotFoundException("Offre de stage introuvable avec id : " + conventionDto.getOffreId()));

        Candidature candidature = candidatureRepository.findById(conventionDto.getCandidatureId())
                .orElseThrow(() -> new EntityNotFoundException("Candidature introuvable avec id : " + conventionDto.getCandidatureId()));

        Enseignant enseignant = null;
        if (conventionDto.getEnseignantId() != null) {
            enseignant = enseignantRepository.findById(conventionDto.getEnseignantId())
                    .orElseThrow(() -> new EntityNotFoundException("Enseignant introuvable avec id : " + conventionDto.getEnseignantId()));
        }

        Convention convention = Convention.builder()
                .dateDebut(conventionDto.getDateDebut())
                .dateFin(conventionDto.getDateFin())
                .statut(StatutConvention.valueOf(conventionDto.getStatut()))
                .cheminPDF(conventionDto.getCheminPDF())
                .objectives(conventionDto.getObjectives())
                .evaluationCritere(conventionDto.getEvaluationCritere())
                .etudiant(etudiant)
                .entreprise(entreprise)
                .enseignant(enseignant)
                .offre(offre)
                .candidature(candidature)
                .createdAt(LocalDateTime.now())
                .build();

        Convention savedConvention = conventionRepository.save(convention);
        return ConventionDto.fromEntity(savedConvention);
    }

    @Override
    public ConventionDto findById(Long id) {
        return conventionRepository.findById(id)
                .map(ConventionDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Convention introuvable avec id : " + id));
    }

    @Override
    public List<ConventionDto> findAll() {
        return conventionRepository.findAll()
                .stream()
                .map(ConventionDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConventionDto updateConvention(Long id, ConventionDto conventionDto) {
        // Validation du DTO
        validator.validate(conventionDto);

        Convention existingConvention = conventionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Convention introuvable avec id : " + id));

        Etudiant etudiant = etudiantRepository.findById(conventionDto.getEtudiantId())
                .orElseThrow(() -> new EntityNotFoundException("Étudiant introuvable avec id : " + conventionDto.getEtudiantId()));

        Entreprise entreprise = entrepriseRepository.findById(conventionDto.getEntrepriseId())
                .orElseThrow(() -> new EntityNotFoundException("Entreprise introuvable avec id : " + conventionDto.getEntrepriseId()));

        Offre offre = offreRepository.findById(conventionDto.getOffreId())
                .orElseThrow(() -> new EntityNotFoundException("Offre de stage introuvable avec id : " + conventionDto.getOffreId()));

        Candidature candidature = candidatureRepository.findById(conventionDto.getCandidatureId())
                .orElseThrow(() -> new EntityNotFoundException("Candidature introuvable avec id : " + conventionDto.getCandidatureId()));

        Enseignant enseignant = null;
        if (conventionDto.getEnseignantId() != null) {
            enseignant = enseignantRepository.findById(conventionDto.getEnseignantId())
                    .orElseThrow(() -> new EntityNotFoundException("Enseignant introuvable avec id : " + conventionDto.getEnseignantId()));
        }

        // Mise à jour des champs
        existingConvention.setDateDebut(conventionDto.getDateDebut());
        existingConvention.setDateFin(conventionDto.getDateFin());
        existingConvention.setStatut(StatutConvention.valueOf(conventionDto.getStatut()));
        existingConvention.setCheminPDF(conventionDto.getCheminPDF());
        existingConvention.setObjectives(conventionDto.getObjectives());
        existingConvention.setEvaluationCritere(conventionDto.getEvaluationCritere());
        existingConvention.setEtudiant(etudiant);
        existingConvention.setEntreprise(entreprise);
        existingConvention.setEnseignant(enseignant);
        existingConvention.setOffre(offre);
        existingConvention.setCandidature(candidature);

        Convention updatedConvention = conventionRepository.save(existingConvention);
        return ConventionDto.fromEntity(updatedConvention);
    }

    @Override
    public void deleteById(Long id) {
        if (!conventionRepository.existsById(id)) {
            throw new EntityNotFoundException("Convention introuvable avec id : " + id);
        }
        conventionRepository.deleteById(id);
    }
    // Récupérer toutes les conventions pour un étudiant
    public List<ConventionDto> findByEtudiantId(Long etudiantId) {
        return conventionRepository.findByEtudiantId(etudiantId)
                .stream()
                .map(ConventionDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Récupérer toutes les conventions validées par un enseignant
    public List<ConventionDto> findByEnseignantId(Long enseignantId) {
        return conventionRepository.findByEnseignantId(enseignantId)
                .stream()
                .map(ConventionDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Exemple pour récupérer les conventions pour un validateur (enseignant qui valide)
    public List<ConventionDto> findByEnseignantValidateurId(Long enseignantId) {
        return conventionRepository.findByEnseignantValidateurId(enseignantId)
                .stream()
                .map(ConventionDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Valider une convention
    @Transactional
    public ConventionDto validateConvention(Long id, String commentaires) {
        Convention convention = conventionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Convention introuvable avec id : " + id));
        convention.setStatut(StatutConvention.VALIDEE);
        convention.setCommentairesValidation(commentaires);
        Convention updated = conventionRepository.save(convention);
        return ConventionDto.fromEntity(updated);
    }

    // Rejeter une convention
    @Transactional
    public ConventionDto rejectConvention(Long id, String reason) {
        Convention convention = conventionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Convention introuvable avec id : " + id));
        convention.setStatut(StatutConvention.REJETEE);
        convention.setCommentairesValidation(reason);
        Convention updated = conventionRepository.save(convention);
        return ConventionDto.fromEntity(updated);
    }

    // Optionnel : demander modification (si on veut gérer ce cas comme pour les rapports)
    @Transactional
    public ConventionDto requestModification(Long id, String commentaires) {
        Convention convention = conventionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Convention introuvable avec id : " + id));
        convention.setStatut(StatutConvention.A_CORRIGER);
        convention.setCommentairesValidation(commentaires);
        Convention updated = conventionRepository.save(convention);
        return ConventionDto.fromEntity(updated);
    }
}

