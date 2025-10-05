package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.Entreprise;
import com.groupe.gestionDesStages.models.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class EntrepriseDto extends UtilisateurDto {

    private String nom;
    private String siret;
    private String secteur;
    private String logoUrl;


    public static EntrepriseDto fromEntity(Entreprise entreprise) {
        if (entreprise == null) {
            return null;
        }
        String roleName = entreprise.getRole() != null ? entreprise.getRole().getName().name() : null;
        String displayName = generateDisplayName(entreprise.getEmail(), roleName);
        
        return EntrepriseDto.builder()
                .id(entreprise.getId())
                .email(entreprise.getEmail())
                .motDePasse(entreprise.getMotDePasse())
                .role(roleName)
                .nom(entreprise.getNom())
                .siret(entreprise.getSiret())
                .secteur(entreprise.getSecteur())
                .logoUrl(entreprise.getLogoUrl())
                .photoProfil(entreprise.getPhotoProfil())
                .actif(entreprise.getActif())
                .fullName(displayName)
                .build();
    }


    public Entreprise toEntity(Role role) {
        Entreprise entreprise = Entreprise.builder()
                .id(this.getId())
                .email(this.getEmail())
                .motDePasse(this.getMotDePasse())
                .role(role)
                .nom(this.nom)
                .siret(this.siret)
                .secteur(this.secteur)
                .logoUrl(this.logoUrl)
                .photoProfil(this.getPhotoProfil())
                .build();
        return entreprise;
    }
    
    private static String generateDisplayName(String email, String role) {
        if (email == null) return "Utilisateur";
        
        String emailPart = email.split("@")[0];
        return emailPart.substring(0, 1).toUpperCase() + emailPart.substring(1);
    }
}
