package com.groupe.gestionDesStages.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "offres")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Offre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;



    private Integer duree;
    private String lieu;
    private String domaine;
    private String competences;
    private String avantages;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "date_limite_candidature")
    private LocalDate dateLimiteCandidature;

    @Column(name = "est_active")
    @Builder.Default
    private Boolean estActive = true;

    @Column(name = "fichier_offre")
    private String fichierOffre;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;
}