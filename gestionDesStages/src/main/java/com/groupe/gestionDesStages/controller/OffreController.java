package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.dto.OffreDto;
import com.groupe.gestionDesStages.service.IOffreService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/offres")
@RequiredArgsConstructor
public class OffreController {

    private final IOffreService offreService;

    /**
     * Crée une nouvelle offre de stage avec la possibilité de joindre un fichier.
     * La requête doit être de type multipart/form-data.
     * Accessible uniquement par un utilisateur avec le rôle 'ENTREPRISE'.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ENTREPRISE')")
    public ResponseEntity<OffreDto> createOffre(@RequestPart("offre") @Valid OffreDto offreDto,
                                                @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            OffreDto createdOffre = offreService.createOffre(offreDto, file);
            return new ResponseEntity<>(createdOffre, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    /**
     * Récupère une offre de stage par son identifiant.
     * Accessible à tous les utilisateurs (y compris les non-authentifiés).
     */
    @GetMapping("/{id}")
    public ResponseEntity<OffreDto> findOffreById(@PathVariable Long id) {
        try {
            OffreDto offre = offreService.findOffreById(id);
            return ResponseEntity.ok(offre);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère toutes les offres de stage.
     * Accessible à tous les utilisateurs (y compris les non-authentifiés).
     */
    @GetMapping("/all")
    public ResponseEntity<List<OffreDto>> findAllOffres() {
        List<OffreDto> offres = offreService.findAllOffres();
        return ResponseEntity.ok(offres);
    }


    /** * Récupère toutes les offres d'une entreprise donnée. * Accessible à tous les utilisateurs. */
    @GetMapping("/entreprise/{entrepriseId}")
    public ResponseEntity<List<OffreDto>> findOffresByEntreprise(@PathVariable Long entrepriseId)
    { try { List<OffreDto> offres = offreService.findByEntrepriseId(entrepriseId);
        return ResponseEntity.ok(offres);
    } catch (EntityNotFoundException e) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
    }

    /**
     * Met à jour une offre de stage.
     * Accessible uniquement par l'entreprise qui a créé l'offre, ou par un administrateur.
     */
    /**
     * Met à jour une offre de stage avec la possibilité de joindre un fichier.
     * Accessible uniquement par l'entreprise qui a créé l'offre, ou par un administrateur.
     * Le endpoint consomme des données de type multipart/form-data.
     */
    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ENTREPRISE')")
    public ResponseEntity<OffreDto> updateOffre(
            @PathVariable Long id,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "duree", required = false) Integer duree,
            @RequestParam(value = "lieu", required = false) String lieu,
            @RequestParam(value = "domaine", required = false) String domaine,
            @RequestParam(value = "competences", required = false) List<String> competences,
            @RequestParam(value = "avantages", required = false) String avantages,
            @RequestParam(value = "dateDebut", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(value = "dateFin", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(value = "dateLimiteCandidature", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateLimiteCandidature,
            @RequestParam(value = "estActive", required = false) Boolean estActive,
            @RequestParam(value = "entrepriseId", required = false) Long entrepriseId,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            // Créer un DTO temporaire pour passer les données au service
            OffreDto updateDto = new OffreDto();
            updateDto.setTitre(titre);
            updateDto.setDescription(description);
            updateDto.setDuree(duree);
            updateDto.setLieu(lieu);
            updateDto.setDomaine(domaine);
            updateDto.setCompetences(String.valueOf(competences));
            updateDto.setAvantages(avantages);
            updateDto.setDateDebut(dateDebut);
            updateDto.setDateFin(dateFin);
            updateDto.setDateLimiteCandidature(dateLimiteCandidature);
            updateDto.setEstActive(estActive);
            updateDto.setEntrepriseId(entrepriseId);

            OffreDto updatedOffre = offreService.updateOffre(id, updateDto, file);
            return ResponseEntity.ok(updatedOffre);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Supprime une offre de stage.
     * Accessible uniquement par l'entreprise qui a créé l'offre, ou par un administrateur.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or @offreService.findOffreById(#id).entrepriseId == authentication.principal.id")
    public ResponseEntity<Void> deleteOffre(@PathVariable Long id) {
        try {
            offreService.deleteOffre(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }
}
