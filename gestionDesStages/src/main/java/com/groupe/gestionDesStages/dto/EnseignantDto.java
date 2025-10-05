package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.Enseignant;
import com.groupe.gestionDesStages.models.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class EnseignantDto extends UtilisateurDto {

    private String nom;
    private String prenom;
    private String departement;
    private String specialite;


    public static EnseignantDto fromEntity(Enseignant enseignant) {
        if (enseignant == null) {
            return null;
        }
        String roleName = enseignant.getRole() != null ? enseignant.getRole().getName().name() : null;
        String displayName = generateDisplayName(enseignant.getEmail(), roleName);
        
        return EnseignantDto.builder()
                .id(enseignant.getId())
                .email(enseignant.getEmail())
                .motDePasse(enseignant.getMotDePasse())
                .role(roleName)
                .nom(enseignant.getNom())
                .prenom(enseignant.getPrenom())
                .departement(enseignant.getDepartement())
                .specialite(enseignant.getSpecialite())
                .photoProfil(enseignant.getPhotoProfil())
                .actif(enseignant.getActif())
                .fullName(displayName)
                .build();
    }


    public Enseignant toEntity(Role role) {
        Enseignant enseignant = Enseignant.builder()
                .id(this.getId())
                .email(this.getEmail())
                .motDePasse(this.getMotDePasse())
                .role(role)
                .nom(this.nom)
                .prenom(this.prenom)
                .departement(this.departement)
                .specialite(this.specialite)
                .photoProfil(this.getPhotoProfil())
                .build();
        return enseignant;
    }
    
    private static String generateDisplayName(String email, String role) {
        if (email == null) return "Utilisateur";
        
        String emailPart = email.split("@")[0];
        return emailPart.substring(0, 1).toUpperCase() + emailPart.substring(1);
    }
}
