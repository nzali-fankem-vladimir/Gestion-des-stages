package com.groupe.gestionDesStages.repository;

import com.groupe.gestionDesStages.models.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {

    // Déjà présent dans JpaRepository mais tu peux le garder
    Optional<Etudiant> findById(Long id);

    List<Etudiant> findByNom(String nom);

    Optional<Etudiant> findByMatricule(String matricule);

    List<Etudiant> findByFiliere(String filiere);

    Optional<Etudiant> findByEmail(String email);

    List<Etudiant> findByNomAndFiliere(String nom, String filiere);
}
