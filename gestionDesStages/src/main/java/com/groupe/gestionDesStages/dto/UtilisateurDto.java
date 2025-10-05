package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.Utilisateur;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class UtilisateurDto {

    private Long id;
    private String email;
    private String motDePasse;
    private String role;
    private String photoProfil;
    private Boolean actif;
    private String fullName;


    public static UtilisateurDto fromEntity(Utilisateur utilisateur) {
        if (utilisateur == null) {
            return null;
        }

        String roleName = utilisateur.getRole() != null ? utilisateur.getRole().getName().name() : null;
        String displayName = generateDisplayName(utilisateur.getEmail(), roleName);
        
        return UtilisateurDto.builder()
                .id(utilisateur.getId())
                .email(utilisateur.getEmail())
                .motDePasse(utilisateur.getMotDePasse())
                .role(roleName)
                .actif(utilisateur.getActif())
                .fullName(displayName)
                .build();
    }
    
    private static String generateDisplayName(String email, String role) {
        if (email == null) return "Utilisateur";
        
        String emailPart = email.split("@")[0];
        return emailPart.substring(0, 1).toUpperCase() + emailPart.substring(1);
    }
}
