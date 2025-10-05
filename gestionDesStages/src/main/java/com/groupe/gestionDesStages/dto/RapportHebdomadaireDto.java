package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.Etudiant;
import com.groupe.gestionDesStages.models.RapportHebdomadaire;
import com.groupe.gestionDesStages.models.Offre;
import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.models.Enseignant;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RapportHebdomadaireDto {
    private Long id;

    // --- Champs d'Entrée (IDs pour les relations) ---
    private Long etudiantId;
    private Long offreId;
    private Long enseignantDestinataireId;

    // --- Champs de Sortie (Objets pour l'affichage) ---
    private EtudiantDto etudiant;
    private OffreDto stage;
    private EntrepriseDto entreprise;
    private UtilisateurDto enseignantDestinataire;

    // --- Contenu du Rapport ---
    private Integer semaineNumero;
    private LocalDate dateDebutSemaine;
    private LocalDate dateFinSemaine;
    private String activitesRealisees;
    private String competencesAcquises;
    private String difficultes;
    private String objectifsSemaineSuivante;
    private String statut;

    // ✍️ CHANGEMENT DTO : ajout des champs liés au fichier
    private String fichierUrl;
    private String nomFichier;
    private String typeFichier;

    // --- Métadonnées ---
    private LocalDateTime dateSoumission;
    private String commentairesEnseignant;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RapportHebdomadaireDto fromEntity(RapportHebdomadaire rapport) {
        if (rapport == null) {
            return null;
        }

        // 1. Récupération et conversion de l'étudiant
        EtudiantDto etudiantDto = null;
        if (rapport.getEtudiant() instanceof Etudiant) {
            etudiantDto = EtudiantDto.fromEntity((Etudiant) rapport.getEtudiant());
        }

        // 2. Récupération et conversion de l'offre et de l'entreprise
        OffreDto stageDto = rapport.getStage() != null ? OffreDto.fromEntity(rapport.getStage()) : null;
        EntrepriseDto entrepriseDto = null;

        if (rapport.getStage() != null && rapport.getStage().getEntreprise() != null) {
            entrepriseDto = EntrepriseDto.fromEntity(rapport.getStage().getEntreprise());
        }

        // 3. Récupération et conversion de l'enseignant
        UtilisateurDto enseignantDto = null;
        if (rapport.getEnseignantDestinataire() instanceof Enseignant) {
            enseignantDto = EnseignantDto.fromEntity((Enseignant) rapport.getEnseignantDestinataire());
        } else if (rapport.getEnseignantDestinataire() != null) {
            enseignantDto = UtilisateurDto.fromEntity(rapport.getEnseignantDestinataire());
        }

        return RapportHebdomadaireDto.builder()
                .id(rapport.getId())
                .etudiant(etudiantDto)
                .stage(stageDto)
                .entreprise(entrepriseDto)
                .enseignantDestinataire(enseignantDto)
                .semaineNumero(rapport.getSemaineNumero())
                .dateDebutSemaine(rapport.getDateDebutSemaine())
                .dateFinSemaine(rapport.getDateFinSemaine())
                .activitesRealisees(rapport.getActivitesRealisees())
                .competencesAcquises(rapport.getCompetencesAcquises())
                .difficultes(rapport.getDifficultes())
                .objectifsSemaineSuivante(rapport.getObjectifsSemaineSuivante())
                .statut(rapport.getStatut() != null ? rapport.getStatut().name() : RapportHebdomadaire.StatutRapport.BROUILLON.name())
                .dateSoumission(rapport.getDateSoumission())
                .commentairesEnseignant(rapport.getCommentairesEnseignant())
                .createdAt(rapport.getCreatedAt())
                .updatedAt(rapport.getUpdatedAt())

                // ✍️ CHANGEMENT DTO : ajout mapping fichier (normalise en URL complète si nécessaire)
                .fichierUrl(buildFileUrl(rapport.getFichierUrl()))
                .nomFichier(rapport.getNomFichier())
                .typeFichier(rapport.getTypeFichier())

                // IDs
                .etudiantId(rapport.getEtudiant() != null ? rapport.getEtudiant().getId() : null)
                .offreId(rapport.getStage() != null ? rapport.getStage().getId() : null)
                .enseignantDestinataireId(rapport.getEnseignantDestinataire() != null ? rapport.getEnseignantDestinataire().getId() : null)
                .build();
    }

    private static String buildFileUrl(String fichierUrl) {
        if (fichierUrl == null || fichierUrl.isBlank()) return null;
        // If it's already an absolute URL, return as-is
        if (fichierUrl.startsWith("http://") || fichierUrl.startsWith("https://")) {
            return fichierUrl;
        }
        // Otherwise assume it's a stored filename and expose via backend files endpoint
        try {
            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/v1/files/")
                    .path(fichierUrl)
                    .toUriString();
        } catch (Exception e) {
            // Fallback to the raw value if building the URL fails
            return fichierUrl;
        }
    }

    public RapportHebdomadaire toEntity(Utilisateur etudiant, Offre stage, Utilisateur enseignant) {
        return RapportHebdomadaire.builder()
                .id(this.id)
                .etudiant(etudiant)
                .stage(stage)
                .enseignantDestinataire(enseignant)
                .semaineNumero(this.semaineNumero)
                .dateDebutSemaine(this.dateDebutSemaine)
                .dateFinSemaine(this.dateFinSemaine)
                .activitesRealisees(this.activitesRealisees)
                .competencesAcquises(this.competencesAcquises)
                .difficultes(this.difficultes)
                .objectifsSemaineSuivante(this.objectifsSemaineSuivante)

                // ✍️ CHANGEMENT DTO → ENTITE
                .fichierUrl(this.fichierUrl)
                .nomFichier(this.nomFichier)
                .typeFichier(this.typeFichier)

                .statut(this.statut != null ? RapportHebdomadaire.StatutRapport.valueOf(this.statut) : RapportHebdomadaire.StatutRapport.BROUILLON)
                .createdAt(this.createdAt != null ? this.createdAt : LocalDateTime.now())
                .updatedAt(this.updatedAt)
                .build();
    }
}
