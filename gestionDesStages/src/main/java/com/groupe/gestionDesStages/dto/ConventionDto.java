package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.*;
import com.groupe.gestionDesStages.models.enums.StatutConvention;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConventionDto {

    private Long id;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statut;
    private String cheminPDF;
    private String objectives;
    private String evaluationCritere;
    private Long etudiantId;
    private String etudiantNom;
    private Long entrepriseId;
    private String nomEntreprise;
    private Long enseignantId;
    private String enseignantNom;
    private Long offreId;
    private String offreTitre;
    private LocalDateTime createdAt;
    private Long candidatureId;
    private Long enseignantValidateurId;
    private String enseignantValidateurNom;



    public static ConventionDto fromEntity(Convention convention) {
        if (convention == null) {
            return null;
        }

        return ConventionDto.builder()
                .id(convention.getId())
                .dateDebut(convention.getDateDebut())
                .dateFin(convention.getDateFin())
                .statut(convention.getStatut() != null ? convention.getStatut().name() : null)
                .cheminPDF(convention.getCheminPDF())
                .objectives(convention.getObjectives())
                .evaluationCritere(convention.getEvaluationCritere())
                .etudiantId(convention.getEtudiant() != null ? convention.getEtudiant().getId() : null)
                .etudiantNom(convention.getEtudiant() != null ? convention.getEtudiant().getNom() : null)
                .entrepriseId(convention.getEntreprise() != null ? convention.getEntreprise().getId() : null)
                .nomEntreprise(convention.getEntreprise() != null ? convention.getEntreprise().getNom() : null)
                .enseignantId(convention.getEnseignant() != null ? convention.getEnseignant().getId() : null)
                .enseignantNom(convention.getEnseignant() != null ? convention.getEnseignant().getNom() : null)
                .offreId(convention.getOffre() != null ? convention.getOffre().getId() : null)
                .offreTitre(convention.getOffre() != null ? convention.getOffre().getTitre() : null)
                .createdAt(convention.getCreatedAt())
                .candidatureId(convention.getCandidature() != null ? convention.getCandidature().getId() : null)
                .enseignantValidateurId(convention.getEnseignantValidateur() != null ? convention.getEnseignantValidateur().getId() : null)
                .enseignantValidateurNom(convention.getEnseignantValidateur() != null ? convention.getEnseignantValidateur().getNom() : null)

                .build();
    }


    public static Convention toEntity(ConventionDto conventionDto, Etudiant etudiant, Entreprise entreprise, Enseignant enseignant, Offre offre, Candidature candidature, Enseignant enseignantValidateur, Admin adminApprobateur) {
        if (conventionDto == null) {
            return null;
        }
        return Convention.builder()
                .id(conventionDto.getId())
                .dateDebut(conventionDto.getDateDebut())
                .dateFin(conventionDto.getDateFin())
                .statut(conventionDto.getStatut() != null ? StatutConvention.valueOf(conventionDto.getStatut()) : null)
                .cheminPDF(conventionDto.getCheminPDF())
                .objectives(conventionDto.getObjectives())
                .evaluationCritere(conventionDto.getEvaluationCritere())
                .etudiant(etudiant)
                .entreprise(entreprise)
                .enseignant(enseignant)
                .offre(offre)
                .createdAt(conventionDto.getCreatedAt())
                .candidature(candidature)
                .enseignantValidateur(enseignantValidateur)
                .build();
    }
}
