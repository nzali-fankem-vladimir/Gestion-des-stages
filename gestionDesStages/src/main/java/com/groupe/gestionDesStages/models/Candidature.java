package com.groupe.gestionDesStages.models;

import com.groupe.gestionDesStages.models.enums.StatutCandidature;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "candidature")
@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateCandidature;

    @Enumerated(EnumType.STRING)
    private StatutCandidature statut;

    private String cvUrl;

    private String lettreMotivation;

    private boolean luParEntreprise;


    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    @ManyToOne
    @JoinColumn(name = "offre_id")
    private Offre offre;
}
