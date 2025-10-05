package com.groupe.gestionDesStages.repository;

import com.groupe.gestionDesStages.models.Candidature;
import com.groupe.gestionDesStages.models.enums.StatutCandidature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CandidatureRepository extends JpaRepository<Candidature, Long> {

    List<Candidature> findByEtudiantId(Long etudiantId);

    @Query("SELECT c FROM Candidature c WHERE c.offre.entreprise.id = :entrepriseId")
    List<Candidature> findByEntrepriseId(@Param("entrepriseId") Long entrepriseId);


    List<Candidature> findByOffreId(Long offreId);


    List<Candidature> findByStatut(StatutCandidature statut);


    boolean existsByEtudiantIdAndOffreId(Long etudiantId, Long offreId);
}
