package com.groupe.gestionDesStages.models;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String motDePasse;

    private String photoProfil;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "actif", nullable = false)
    @Builder.Default
    private Boolean actif = false; // Par défaut, les nouveaux utilisateurs ne sont pas actifs

}