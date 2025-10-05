package com.groupe.gestionDesStages.repository;

import com.groupe.gestionDesStages.models.Enseignant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnseignantRepository extends JpaRepository<Enseignant, Long> {

    Optional<Enseignant> findByEmail(String email);
    Optional<Enseignant> findById(Long id);
    List<Enseignant> findByNom(String nom);
    List<Enseignant> findBySpecialite(String specialite);
}
