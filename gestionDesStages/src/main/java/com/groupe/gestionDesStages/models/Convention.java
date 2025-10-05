package com.groupe.gestionDesStages.models;

import com.groupe.gestionDesStages.models.enums.StatutConvention;
import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "convention")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Convention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    private StatutConvention statut;

    private String cheminPDF;

    private String objectives;

    private String evaluationCritere;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Etudiant etudiant;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Entreprise entreprise;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Enseignant enseignant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internship_id", nullable = false)
    private Offre offre;

    private LocalDateTime createdAt;


    @OneToOne
    @JoinColumn(name = "candidature_id", unique = true)
    private Candidature candidature;

    @ManyToOne
    @JoinColumn(name = "enseignant_validateur_id")
    private Enseignant enseignantValidateur;


    public void setCommentairesValidation(String commentaires) {
    }
}
