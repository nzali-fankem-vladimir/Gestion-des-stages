package com.groupe.gestionDesStages.security;

import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ResetAdminPassword {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner adminPasswordReset() {
        return args -> {
            final String adminEmail = "admin@example.com";
            final String newPassword = "admin"; // Mot de passe très simple
            
            try {
                var adminUser = utilisateurRepository.findByEmail(adminEmail);
                if (adminUser.isPresent()) {
                    Utilisateur admin = adminUser.get();
                    
                    // Réinitialiser complètement le mot de passe
                    String encodedPassword = passwordEncoder.encode(newPassword);
                    admin.setMotDePasse(encodedPassword);
                    admin.setActif(true); // S'assurer que l'admin est actif
                    
                    utilisateurRepository.save(admin);
                    
                    System.out.println("=== RESET ADMIN PASSWORD ===");
                    System.out.println("Email: " + adminEmail);
                    System.out.println("Nouveau mot de passe: " + newPassword);
                    System.out.println("Mot de passe encodé: " + encodedPassword);
                    System.out.println("Utilisateur actif: " + admin.getActif());
                    
                    // Test de vérification du mot de passe
                    boolean passwordMatches = passwordEncoder.matches(newPassword, encodedPassword);
                    System.out.println("Test de vérification du mot de passe: " + passwordMatches);
                    System.out.println("=============================");
                } else {
                    System.err.println("Utilisateur admin non trouvé avec l'email: " + adminEmail);
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de la réinitialisation du mot de passe admin: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}
