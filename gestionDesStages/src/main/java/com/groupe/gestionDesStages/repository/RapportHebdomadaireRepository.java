package com.groupe.gestionDesStages.repository;

import com.groupe.gestionDesStages.models.RapportHebdomadaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RapportHebdomadaireRepository extends JpaRepository<RapportHebdomadaire, Long> {



    List<RapportHebdomadaire> findByEtudiantId(Long etudiantId);


    List<RapportHebdomadaire> findByStageId(Long stageId);

    List<RapportHebdomadaire> findByEtudiantIdAndStageId(Long etudiantId, Long stageId);

    List<RapportHebdomadaire> findByEtudiantIdOrderBySemaineNumeroAsc(Long etudiantId);

    List<RapportHebdomadaire> findByStageIdOrderBySemaineNumeroAsc(Long stageId);

    List<RapportHebdomadaire> findByEtudiantIdAndStageIdOrderBySemaineNumeroAsc(Long etudiantId, Long stageId);
}