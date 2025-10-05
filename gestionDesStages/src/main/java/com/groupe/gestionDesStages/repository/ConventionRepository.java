package com.groupe.gestionDesStages.repository;

import com.groupe.gestionDesStages.models.Convention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConventionRepository extends JpaRepository<Convention, Long> {

    List<Convention> findByEtudiantId(Long etudiantId);

    List<Convention> findByEntrepriseId(Long entrepriseId);

    List<Convention> findByEnseignantValidateurId(Long enseignantId);

    List<Convention> findByEnseignantId(Long teacherId);
}
