package com.groupe.gestionDesStages.repository;

import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.models.enums.ERole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<Utilisateur> findByRole_Name(ERole roleName);

    List<Utilisateur> findByActif(Boolean actif);
}
