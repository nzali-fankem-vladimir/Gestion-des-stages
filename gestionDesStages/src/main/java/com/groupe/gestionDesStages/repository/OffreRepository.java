package com.groupe.gestionDesStages.repository;


import com.groupe.gestionDesStages.models.Offre;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OffreRepository extends JpaRepository<Offre, Long> {
    List<Offre> findByDomaine(String domaine);
    List<Offre> findByLieu(String lieu);
    List<Offre> findByEntrepriseId(Long entrepriseId);
}
