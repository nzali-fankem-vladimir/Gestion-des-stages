package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.Candidature;
import com.groupe.gestionDesStages.models.Etudiant;
import com.groupe.gestionDesStages.models.Offre;
import com.groupe.gestionDesStages.models.enums.StatutCandidature;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CandidatureDto {

    private Long id;
    private LocalDate dateCandidature;
    private String statut;
    private String cvUrl;
    private String lettreMotivation;
    private boolean luParEntreprise;
    private Long etudiantId;

    private String etudiantNom;
    private String etudiantPrenom;
    private String etudiantEmail;
    private String etudiantTelephone;
    private Long offreId;
    private String offreTitre;
    private String offreDomaine;
    private String offreLieu;
    private String offreDescription;


    public static CandidatureDto fromEntity(Candidature candidature) {
        if (candidature == null) {
            return null;
        }

        return CandidatureDto.builder()
                .id(candidature.getId())
                .dateCandidature(candidature.getDateCandidature())
                .statut(candidature.getStatut() != null ? candidature.getStatut().name() : null)
                .cvUrl(candidature.getCvUrl())
                .lettreMotivation(candidature.getLettreMotivation())
                .luParEntreprise(candidature.isLuParEntreprise())
                .etudiantId(candidature.getEtudiant() != null ? candidature.getEtudiant().getId() : null)
                .etudiantNom(candidature.getEtudiant() != null ? candidature.getEtudiant().getNom() : null)
                .etudiantPrenom(candidature.getEtudiant() != null ? candidature.getEtudiant().getPrenom() : null)
                .etudiantEmail(candidature.getEtudiant() != null ? candidature.getEtudiant().getEmail() : null)
                .etudiantTelephone(candidature.getEtudiant() != null ? candidature.getEtudiant().getTelephone() : null)
                .offreId(candidature.getOffre() != null ? candidature.getOffre().getId() : null)
                .offreTitre(candidature.getOffre() != null ? candidature.getOffre().getTitre() : null)
                .offreDomaine(candidature.getOffre() != null ? candidature.getOffre().getDomaine() : null)
                .offreLieu(candidature.getOffre() != null ? candidature.getOffre().getLieu() : null)
                .offreDescription(candidature.getOffre() != null ? candidature.getOffre().getDescription() : null)
                .build();
    }


    public static Candidature toEntity(CandidatureDto candidatureDto, Etudiant etudiant, Offre offre) {
        if (candidatureDto == null) {
            return null;
        }

        return Candidature.builder()
                .id(candidatureDto.getId())
                .dateCandidature(candidatureDto.getDateCandidature())
                .statut(candidatureDto.getStatut() != null ? StatutCandidature.valueOf(candidatureDto.getStatut()) : null)
                .cvUrl(candidatureDto.getCvUrl())
                .lettreMotivation(candidatureDto.getLettreMotivation())
                .luParEntreprise(candidatureDto.isLuParEntreprise())
                .etudiant(etudiant)
                .offre(offre)
                .build();
    }
}
