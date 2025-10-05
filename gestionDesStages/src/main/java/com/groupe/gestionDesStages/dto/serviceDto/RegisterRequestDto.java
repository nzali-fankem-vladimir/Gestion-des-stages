package com.groupe.gestionDesStages.dto.serviceDto;

import com.groupe.gestionDesStages.models.*;
import com.groupe.gestionDesStages.models.enums.ERole;
import lombok.*;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDto {
    private String email;
    private String motDePasse;
    private ERole role;
    private String nom;
    private String prenom;
    private String matricule;
    private String filiere;
    private String siret;
    private String secteur;
    private String logoUrl;
    private String departement;
    private String specialite;
    private String photoProfil;

    public Utilisateur toUtilisateur() {
        switch (this.role) {
            case ETUDIANT:
                return Etudiant.builder()
                        .email(this.email)
                        .motDePasse(this.motDePasse)
                        .photoProfil(this.photoProfil)
                        .nom(this.nom)
                        .prenom(this.prenom)
                        .matricule(this.matricule)
                        .filiere(this.filiere)
                        .build();
            case ENTREPRISE:
                return Entreprise.builder()
                        .email(this.email)
                        .motDePasse(this.motDePasse)
                        .photoProfil(this.photoProfil)
                        .nom(this.nom)
                        .siret(this.siret)
                        .secteur(this.secteur)
                        .logoUrl(this.logoUrl)
                        .build();
            case ENSEIGNANT:
                return Enseignant.builder()
                        .email(this.email)
                        .motDePasse(this.motDePasse)
                        .photoProfil(this.photoProfil)
                        .nom(this.nom)
                        .prenom(this.prenom)
                        .departement(this.departement)
                        .specialite(this.specialite)
                        .build();
            case ADMIN:
                return Admin.builder()
                        .email(this.email)
                        .motDePasse(this.motDePasse)
                        .photoProfil(this.photoProfil)
                        .build();
            default:
                throw new IllegalArgumentException("Rôle inconnu : " + this.role);
        }
    }


}
