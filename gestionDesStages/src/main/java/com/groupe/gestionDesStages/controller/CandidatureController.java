package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.dto.CandidatureDto;
import com.groupe.gestionDesStages.service.ICandidatureService;
import com.groupe.gestionDesStages.service.IEtudiantService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/candidatures")
@RequiredArgsConstructor
public class CandidatureController {

    private final ICandidatureService candidatureService;
    private final IEtudiantService etudiantService;

    /**
     * Crée une nouvelle candidature simple (JSON uniquement).
     * Accessible uniquement par un utilisateur avec le rôle 'ETUDIANT'.
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<CandidatureDto> createCandidatureSimple(
            @RequestBody @Valid CandidatureDto candidatureDto) {
        try {
            CandidatureDto createdCandidature = candidatureService.createCandidature(candidatureDto, null, null);
            return new ResponseEntity<>(createdCandidature, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    /**
     * Crée une nouvelle candidature avec la possibilité de joindre un CV.
     * Accessible uniquement par un utilisateur avec le rôle 'ETUDIANT'.
     */
    @PostMapping(path = "/with-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<CandidatureDto> createCandidature(
            @RequestPart("candidature") @Valid CandidatureDto candidatureDto,
            @RequestPart(value = "cvFile", required = false) MultipartFile cvFile,
            @RequestPart(value = "lettreMotivationFile", required = false) MultipartFile lettreMotivationFile) {
        try {
            CandidatureDto createdCandidature = candidatureService.createCandidature(candidatureDto, cvFile, lettreMotivationFile);
            return new ResponseEntity<>(createdCandidature, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    /**
     * Met à jour une candidature existante avec des champs individuels.
     * Accessible uniquement par l'étudiant qui a créé la candidature ou par un administrateur.
     */
    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ETUDIANT') or hasAuthority('ENTREPRISE')")
    public ResponseEntity<CandidatureDto> updateCandidature(
            @PathVariable Long id,
            @RequestParam(value = "statut", required = false) String statut,
            @RequestParam(value = "lettreMotivation", required = false) String lettreMotivation,
            @RequestParam(value = "luParEntreprise", required = false) Boolean luParEntreprise,
            @RequestPart(value = "cvFile", required = false) MultipartFile cvFile,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Récupérer la candidature existante pour vérifier les permissions
            CandidatureDto existingCandidature = candidatureService.findById(id);

            // Vérifier si l'utilisateur actuel est admin
            boolean isCurrentUserAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ADMIN"));

            // Vérifier si l'utilisateur actuel est une entreprise
            boolean isCurrentUserEntreprise = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ENTREPRISE"));

            // Vérifier les permissions : admin ou propriétaire de la candidature (même logique que EtudiantController)
            String ownerEmail = null;
            if (existingCandidature.getEtudiantId() != null) {
                ownerEmail = etudiantService.findById(existingCandidature.getEtudiantId()).getEmail();
            }
            // Autoriser aussi l'entreprise à modifier certains champs (statut, luParEntreprise)
            if (!isCurrentUserAdmin && !isCurrentUserEntreprise && (ownerEmail == null || !userDetails.getUsername().equals(ownerEmail))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé : Vous n'êtes pas autorisé à modifier cette candidature.");
            }


            // Créer un DTO temporaire pour passer les données au service
            CandidatureDto updateDto = new CandidatureDto();
            updateDto.setStatut(statut);
            updateDto.setLettreMotivation(lettreMotivation);
            if (luParEntreprise != null) {
                updateDto.setLuParEntreprise(luParEntreprise);
            }

            CandidatureDto updatedCandidature = candidatureService.updateCandidatureWithFields(id, updateDto, cvFile);
            return ResponseEntity.ok(updatedCandidature);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erreur lors du traitement de la requête: " + e.getMessage(), e);
        }
    }


    /**
     * Récupère toutes les candidatures.
     * Accessible uniquement par un administrateur.
     */
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<CandidatureDto>> findAllCandidatures() {
        List<CandidatureDto> candidatures = candidatureService.findAll();
        return ResponseEntity.ok(candidatures);
    }

    /**
     * Récupère une candidature par son identifiant.
     * Accessible à tous les utilisateurs (y compris les non-authentifiés).
     */
    @GetMapping("/{id}")
    public ResponseEntity<CandidatureDto> findCandidatureById(@PathVariable Long id) {
        try {
            CandidatureDto candidature = candidatureService.findById(id);
            return ResponseEntity.ok(candidature);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère toutes les candidatures d'un étudiant.
     * Accessible uniquement par l'étudiant concerné ou par un administrateur.
     */
    @GetMapping("/etudiant/{etudiantId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ETUDIANT')")
    public ResponseEntity<List<CandidatureDto>> findCandidaturesByEtudiantId(@PathVariable Long etudiantId) {
        List<CandidatureDto> candidatures = candidatureService.findByEtudiantId(etudiantId);
        return ResponseEntity.ok(candidatures);
    }

    /**
     * Récupère toutes les candidatures pour une offre donnée.
     * Accessible uniquement par l'entreprise qui a créé l'offre ou par un administrateur.
     */
    @GetMapping("/offre/{offreId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ENTREPRISE')")
    public ResponseEntity<List<CandidatureDto>> findCandidaturesByOffreId(@PathVariable Long offreId) {
        List<CandidatureDto> candidatures = candidatureService.findByOffreId(offreId);
        return ResponseEntity.ok(candidatures);
    }

    /**
     * Récupère toutes les candidatures liées à une entreprise (toutes offres de cette entreprise).
     * Accessible par l'entreprise concernée ou un administrateur.
     */
    @GetMapping("/entreprise/{entrepriseId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ENTREPRISE')")
    public ResponseEntity<List<CandidatureDto>> findCandidaturesByEntrepriseId(@PathVariable Long entrepriseId) {
        List<CandidatureDto> candidatures = candidatureService.findByEntrepriseId(entrepriseId);
        return ResponseEntity.ok(candidatures);
    }

    /**
     * Supprime une candidature.
     * Accessible uniquement par l'étudiant qui a créé la candidature ou par un administrateur.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or @candidatureService.findById(#id).etudiantId == authentication.principal.id")
    public ResponseEntity<Void> deleteCandidature(@PathVariable Long id) {
        try {
            candidatureService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }
}
