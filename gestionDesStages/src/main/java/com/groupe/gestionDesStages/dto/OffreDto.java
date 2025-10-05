package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.Entreprise;
import com.groupe.gestionDesStages.models.Offre;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OffreDto {
    private Long id;
    private String titre;
    private String description;
    private Integer duree;
    private String lieu;
    private String domaine;
    private String competences;
    private String avantages;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private LocalDate dateLimiteCandidature;
    private Boolean estActive;
    private String fichierOffre;
    private LocalDateTime createdAt;
    private Long entrepriseId;
    private String nomEntreprise;


    public static OffreDto fromEntity(Offre offre) {
        if (offre == null) {
            return null;
        }

        return OffreDto.builder()
                .id(offre.getId())
                .titre(offre.getTitre())
                .description(offre.getDescription())
                .duree(offre.getDuree())
                .lieu(offre.getLieu())
                .domaine(offre.getDomaine())
                .competences(offre.getCompetences())
                .avantages(offre.getAvantages())
                .dateDebut(offre.getDateDebut())
                .dateFin(offre.getDateFin())
                .dateLimiteCandidature(offre.getDateLimiteCandidature())
                .estActive(offre.getEstActive())
                .fichierOffre(offre.getFichierOffre())
                .createdAt(offre.getCreatedAt())
                .entrepriseId(offre.getEntreprise() != null ? offre.getEntreprise().getId() : null)
                .nomEntreprise(offre.getEntreprise() != null ? offre.getEntreprise().getNom() : null)
                .build();
    }


    public Offre toEntity(Entreprise entreprise) {
        return Offre.builder()
                .id(this.id)
                .titre(this.titre)
                .description(this.description)
                .duree(this.duree)
                .lieu(this.lieu)
                .domaine(this.domaine)
                .competences(this.competences)
                .avantages(this.avantages)
                .dateDebut(this.dateDebut)
                .dateFin(this.dateFin)
                .dateLimiteCandidature(this.dateLimiteCandidature)
                .estActive(this.estActive != null ? this.estActive : true)
                .fichierOffre(this.fichierOffre)
                .createdAt(this.createdAt != null ? this.createdAt : LocalDateTime.now())
                .entreprise(entreprise)
                .build();
    }
}
