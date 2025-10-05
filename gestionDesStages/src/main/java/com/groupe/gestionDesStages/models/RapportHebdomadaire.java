package com.groupe.gestionDesStages.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rapports_hebdomadaires")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class RapportHebdomadaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Utilisateur etudiant;

    @ManyToOne
    @JoinColumn(name = "stage_id", nullable = false)
    private Offre stage;

    @Column(name = "semaine_numero")
    private Integer semaineNumero;

    @Column(name = "date_debut_semaine")
    private LocalDate dateDebutSemaine;

    @Column(name = "date_fin_semaine")
    private LocalDate dateFinSemaine;

    @Column(columnDefinition = "TEXT")
    private String activitesRealisees;

    @Column(columnDefinition = "TEXT")
    private String competencesAcquises;

    @Column(columnDefinition = "TEXT")
    private String difficultes;

    @Column(columnDefinition = "TEXT")
    private String objectifsSemaineSuivante;

    // CHANGEMENT ENTITE : suppression de byte[] contenuFichier, ajout nomFichier et typeFichier
    @Column(name = "fichier_url")
    private String fichierUrl; // chemin/URL du fichier sur disque

    @Column(name = "nom_fichier")
    private String nomFichier;

    @Column(name = "type_fichier")
    private String typeFichier;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    @Builder.Default
    private StatutRapport statut = StatutRapport.BROUILLON;

    @ManyToOne
    @JoinColumn(name = "enseignant_destinataire_id")
    private Utilisateur enseignantDestinataire;

    @Column(name = "date_soumission")
    private LocalDateTime dateSoumission;

    @Column(columnDefinition = "TEXT")
    private String commentairesEnseignant;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum StatutRapport {
        BROUILLON, SOUMIS, VALIDE, REJETE
    }
}
