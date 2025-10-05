package com.groupe.gestionDesStages.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "etudiant")
@Getter
@Setter
@AllArgsConstructor
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Etudiant extends Utilisateur {

    private String nom;

    private String prenom;

    @Column(name = "matricule", unique = true)
    private String matricule;

    @Column(name = "filiere")
    private String filiere;

    @Column(name = "cv_file")
    private String cvFile;

    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;
}