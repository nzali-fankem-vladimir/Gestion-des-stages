package com.groupe.gestionDesStages.security;

import com.groupe.gestionDesStages.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var utilisateur = utilisateurRepository
                .findByEmail(username)
                .orElseThrow(
                        () -> new UsernameNotFoundException("Utilisateur non trouvé avec l'email : " + username)
                );
        
        System.out.println("=== DEBUG AUTHENTICATION ===");
        System.out.println("Email: " + username);
        System.out.println("Utilisateur trouvé: " + (utilisateur != null));
        System.out.println("Utilisateur actif: " + (utilisateur != null ? utilisateur.getActif() : "null"));
        System.out.println("=============================");
        
        return new UtilisateurPrincipal(utilisateur);
    }
}
