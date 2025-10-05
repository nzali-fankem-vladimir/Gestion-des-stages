package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.Etudiant;
import com.groupe.gestionDesStages.models.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class EtudiantDto extends UtilisateurDto {

    private String nom;
    private String prenom;
    private String matricule;
    private String filiere;
    private String cvFile;

    // Convertir une entité vers DTO
    public static EtudiantDto fromEntity(Etudiant etudiant) {
        if (etudiant == null) {
            return null;
        }
        String roleName = etudiant.getRole() != null ? etudiant.getRole().getName().name() : null;
        String displayName = generateDisplayName(etudiant.getEmail(), roleName);
        
        return EtudiantDto.builder()
                .id(etudiant.getId())
                .email(etudiant.getEmail())
                .motDePasse(etudiant.getMotDePasse())
                .role(roleName)
                .photoProfil(etudiant.getPhotoProfil())
                .nom(etudiant.getNom())
                .prenom(etudiant.getPrenom())
                .matricule(etudiant.getMatricule())
                .filiere(etudiant.getFiliere())
                .cvFile(etudiant.getCvFile())
                .actif(etudiant.getActif())
                .fullName(displayName)
                .build();
    }

    // Convertir un DTO vers entité
    public Etudiant toEntity(Role role) {
        return Etudiant.builder()
                .id(this.getId())
                .email(this.getEmail())
                .motDePasse(this.getMotDePasse())
                .role(role)
                .photoProfil(this.getPhotoProfil())
                .nom(this.getNom())
                .prenom(this.getPrenom())
                .matricule(this.getMatricule())
                .filiere(this.getFiliere())
                .cvFile(this.getCvFile())
                .build();
    }
    
    private static String generateDisplayName(String email, String role) {
        if (email == null) return "Utilisateur";
        
        String emailPart = email.split("@")[0];
        return emailPart.substring(0, 1).toUpperCase() + emailPart.substring(1);
    }
}
