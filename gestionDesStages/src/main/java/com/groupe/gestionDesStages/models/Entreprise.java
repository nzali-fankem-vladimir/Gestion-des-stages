package com.groupe.gestionDesStages.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "entreprise")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
public class Entreprise extends Utilisateur {

    private String nom;

    @Column(name = "siret", unique = true)
    private String siret;

    @Column(name = "secteur")
    private String secteur;

    @Column(name = "logo_url")
    private String logoUrl;
}