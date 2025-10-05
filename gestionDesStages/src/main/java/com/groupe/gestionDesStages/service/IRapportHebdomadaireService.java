package com.groupe.gestionDesStages.service;

import com.groupe.gestionDesStages.dto.RapportHebdomadaireDto;
import com.groupe.gestionDesStages.models.RapportHebdomadaire;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Interface de service pour la gestion des rapports hebdomadaires.
 */
public interface IRapportHebdomadaireService {

    /**
     * Crée et enregistre un nouveau rapport hebdomadaire.
     * @param rapportHebdomadaireDto Les données du rapport (incluant les IDs des entités liées).
     * @param file Le fichier annexe à associer au rapport (peut être null).
     * @return Le DTO du rapport créé.
     */
    RapportHebdomadaireDto createRapport(RapportHebdomadaireDto rapportHebdomadaireDto, MultipartFile file);

    // Méthode utilitaire interne pour la récupération d'entité
    RapportHebdomadaire findEntityById(Long id);

    RapportHebdomadaireDto findById(Long id);
    List<RapportHebdomadaireDto> findAll();

    List<RapportHebdomadaireDto> findByEtudiantId(Long etudiantId);
    List<RapportHebdomadaireDto> findByOffreId(Long offreId);

    List<RapportHebdomadaireDto> findRapportsByEtudiantIdSorted(Long etudiantId);
    List<RapportHebdomadaireDto> findRapportsByOffreIdSorted(Long offreId);
    List<RapportHebdomadaireDto> findRapportsByEtudiantIdAndOffreIdSorted(Long etudiantId, Long offreId);

    /**
     * Met à jour un rapport existant.
     * @param id L'ID du rapport à mettre à jour.
     * @param rapportHebdomadaireDto Les données de mise à jour.
     * @param file Le nouveau fichier annexe (si fourni, remplace l'ancien).
     * @return Le DTO du rapport mis à jour.
     */
    RapportHebdomadaireDto updateRapport(Long id, RapportHebdomadaireDto rapportHebdomadaireDto, MultipartFile file);

    /**
     * Soumet un rapport, met à jour son statut et assigne un enseignant destinataire.
     */
    RapportHebdomadaireDto submitRapport(Long id, String statut, Long enseignantId);

    // Méthodes pour les enseignants
    /**
     * Trouve tous les rapports destinés à un enseignant spécifique.
     */
    List<RapportHebdomadaireDto> findRapportsByEnseignant(Long enseignantId);
    RapportHebdomadaireDto validateRapport(Long id, String commentaires);
    RapportHebdomadaireDto requestModification(Long id, String commentaires);
    RapportHebdomadaireDto rejectRapport(Long id, String reason);

    void deleteById(Long id);
}
