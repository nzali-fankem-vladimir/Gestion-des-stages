package com.groupe.gestionDesStages.repository;

import com.groupe.gestionDesStages.models.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {

    Optional<Entreprise> findByEmail(String email);

    Optional<Entreprise> findBySiret(String siret);
}