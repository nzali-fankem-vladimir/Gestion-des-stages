package com.groupe.gestionDesStages.models;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "enseignant")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
public class Enseignant extends Utilisateur {

    private String nom;

    private String prenom;

    private String departement;

    private String specialite;
}