package com.groupe.gestionDesStages.security;

import com.groupe.gestionDesStages.models.Role;
import com.groupe.gestionDesStages.models.enums.ERole;
import com.groupe.gestionDesStages.repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class InitRolesConfig {

    private final RoleRepository roleRepository;

    @PostConstruct
    public void initRoles() {
        // Tous les rôles à créer
        List<ERole> roles = Arrays.asList(ERole.ADMIN, ERole.ENSEIGNANT, ERole.ENTREPRISE, ERole.ETUDIANT);

        roles.forEach(roleEnum -> {
            // Vérifie si le rôle existe déjà
            if (!roleRepository.existsByName(roleEnum)) {
                Role role = new Role();
                role.setName(roleEnum); // utilise l'enum
                roleRepository.save(role);
                System.out.println("Rôle ajouté : " + roleEnum);
            }
        });
    }
}
