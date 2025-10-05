package com.groupe.gestionDesStages.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.groupe.gestionDesStages.dto.EnseignantDto;
import com.groupe.gestionDesStages.service.IEnseignantService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;


import java.util.List;

@RestController
@RequestMapping("/api/v1/enseignants")
@RequiredArgsConstructor
public class EnseignantController {

    private final IEnseignantService enseignantService;
    private final ObjectMapper objectMapper;

    /**
     * Crée un nouvel enseignant.
     * Endpoint: POST /api/v1/enseignants
     * @param enseignantDto Le DTO de l'enseignant.
     * @return L'enseignant créé avec un statut HTTP 201.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EnseignantDto> createEnseignant(@RequestBody EnseignantDto enseignantDto) {
        try {
            EnseignantDto createdEnseignant = enseignantService.createEnseignant(enseignantDto);
            return new ResponseEntity<>(createdEnseignant, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    /**
     * Récupère un enseignant par son identifiant.
     * Endpoint: GET /api/v1/enseignants/{id}
     * @param id L'ID de l'enseignant.
     * @return L'enseignant trouvé ou un statut 404.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EnseignantDto> findById(@PathVariable Long id) {
        try {
            EnseignantDto enseignant = enseignantService.findById(id);
            return ResponseEntity.ok(enseignant);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère tous les enseignants.
     * Endpoint: GET /api/v1/enseignants/all
     * @return Une liste de tous les enseignants.
     */
    @GetMapping("/all")
    public ResponseEntity<List<EnseignantDto>> findAll() {
        List<EnseignantDto> enseignants = enseignantService.findAll();
        return ResponseEntity.ok(enseignants);
    }

    /**
     * Récupère un enseignant par son email.
     * Endpoint: GET /api/v1/enseignants/email/{email}
     * @param email L'email de l'enseignant.
     * @return L'enseignant trouvé ou un statut 404.
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<EnseignantDto> findByEmail(@PathVariable String email) {
        try {
            EnseignantDto enseignant = enseignantService.findByEmail(email);
            return ResponseEntity.ok(enseignant);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Met à jour un enseignant existant avec la possibilité d'uploader une photo de profil.
     * Endpoint: PUT /api/v1/enseignants/{id}
     * @param id L'ID de l'enseignant à mettre à jour.
     * @param nom Le nouveau nom de l'enseignant (optionnel).
     * @param prenom Le nouveau prénom (optionnel).
     * @param departement Le nouveau département (optionnel).
     * @param specialite La nouvelle spécialité (optionnelle).
     * @param photoFile La nouvelle photo de profil (optionnelle).
     * @param authentication Les informations d'authentification de l'utilisateur.
     * @return L'enseignant mis à jour.
     */
    @PutMapping(path = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ENSEIGNANT')")
    public ResponseEntity<EnseignantDto> updateEnseignant(
            @PathVariable Long id,
            @RequestParam(value = "nom", required = false) String nom,
            @RequestParam(value = "prenom", required = false) String prenom,
            @RequestParam(value = "departement", required = false) String departement,
            @RequestParam(value = "specialite", required = false) String specialite,
            @RequestPart(value = "photo", required = false) MultipartFile photoFile,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Récupérer l'enseignant existant pour la vérification
            EnseignantDto existingEnseignant = enseignantService.findById(id);

            // NOUVELLE LOGIQUE : L'utilisateur connecté doit être ADMIN ou l'enseignant concerné
            boolean isCurrentUserAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ADMIN"));

            if (!isCurrentUserAdmin && !userDetails.getUsername().equals(existingEnseignant.getEmail())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé : Vous n'êtes pas autorisé à modifier cet enseignant.");
            }

            // Créer un DTO temporaire pour passer les données au service
            EnseignantDto updateDto = new EnseignantDto();
            updateDto.setNom(nom);
            updateDto.setPrenom(prenom);
            updateDto.setDepartement(departement);
            updateDto.setSpecialite(specialite);

            EnseignantDto updatedEnseignant = enseignantService.updateEnseignantWithFiles(id, updateDto, photoFile);
            return ResponseEntity.ok(updatedEnseignant);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Supprime un enseignant par son identifiant.
     * Endpoint: DELETE /api/v1/enseignants/{id}
     * @param id L'ID de l'enseignant à supprimer.
     * @return Une réponse avec un statut HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteEnseignant(@PathVariable Long id) {
        try {
            enseignantService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }
}
