package com.groupe.gestionDesStages.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.groupe.gestionDesStages.dto.EntrepriseDto;
import com.groupe.gestionDesStages.service.IEntrepriseService;
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

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/entreprises")
@RequiredArgsConstructor
public class EntrepriseController {

    private final IEntrepriseService entrepriseService;
    private final ObjectMapper objectMapper;

    /**
     * Crée une nouvelle entreprise avec la possibilité d'uploader une photo de profil et un logo.
     * Endpoint: POST /api/v1/entreprises
     * @param entrepriseJson Le DTO de l'entreprise au format JSON.
     * @param photoFile La photo de profil de l'entreprise (optionnelle).
     * @param logoFile Le logo de l'entreprise (optionnel).
     * @return L'entreprise créée avec un statut HTTP 201.
     */
    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EntrepriseDto> createEntreprise(
            @RequestPart("entreprise") String entrepriseJson,
            @RequestPart(value = "photo", required = false) MultipartFile photoFile,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile) {

        try {
            EntrepriseDto entrepriseDto = objectMapper.readValue(entrepriseJson, EntrepriseDto.class);
            // La logique de gestion des fichiers est déplacée dans le service
            EntrepriseDto createdEntreprise = entrepriseService.createEntrepriseWithFiles(entrepriseDto, logoFile, photoFile);

            return new ResponseEntity<>(createdEntreprise, HttpStatus.CREATED);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erreur lors du traitement de la requête: " + e.getMessage(), e);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    /**
     * Récupère une entreprise par son identifiant.
     * Endpoint: GET /api/v1/entreprises/{id}
     * @param id L'ID de l'entreprise.
     * @return L'entreprise trouvée ou un statut 404.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EntrepriseDto> findById(@PathVariable Long id) {
        try {
            EntrepriseDto entreprise = entrepriseService.findById(id);
            return ResponseEntity.ok(entreprise);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère toutes les entreprises.
     * Endpoint: GET /api/v1/entreprises/all
     * @return Une liste de toutes les entreprises.
     */
    @GetMapping("/all")
    public ResponseEntity<List<EntrepriseDto>> findAll() {
        List<EntrepriseDto> entreprises = entrepriseService.findAll();
        return ResponseEntity.ok(entreprises);
    }

    /**
     * Récupère une entreprise par son email.
     * Endpoint: GET /api/v1/entreprises/email/{email}
     * @param email L'email de l'entreprise.
     * @return L'entreprise trouvée ou un statut 404.
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<EntrepriseDto> findByEmail(@PathVariable String email) {
        try {
            EntrepriseDto entreprise = entrepriseService.findByEmail(email);
            return ResponseEntity.ok(entreprise);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Met à jour une entreprise existante.
     * Endpoint: PUT /api/v1/entreprises/{id}
     * @param id L'ID de l'entreprise à mettre à jour.
     * @param nom Le nouveau nom de l'entreprise (optionnel).
     * @param siret Le nouveau SIRET (optionnel).
     * @param secteur Le nouveau secteur (optionnel).
     * @param photoFile La nouvelle photo de profil (optionnelle).
     * @param logoFile Le nouveau logo (optionnel).
     * @return L'entreprise mise à jour.
     */
    @PutMapping(path = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ENTREPRISE')")
    public ResponseEntity<EntrepriseDto> updateEntreprise(
            @PathVariable Long id,
            @RequestParam(value = "nom", required = false) String nom,
            @RequestParam(value = "siret", required = false) String siret,
            @RequestParam(value = "secteur", required = false) String secteur,
            @RequestPart(value = "photo", required = false) MultipartFile photoFile,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile,
            Authentication authentication) {
        try {
            // Récupérer l'ID de l'utilisateur connecté
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Vérifier si l'email de l'utilisateur connecté correspond à celui de l'entreprise
            EntrepriseDto existingEntreprise = entrepriseService.findById(id);
            if (!userDetails.getUsername().equals(existingEntreprise.getEmail())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé : Vous n'êtes pas autorisé à modifier cette entreprise.");
            }

            // Créer un DTO temporaire pour passer les données au service
            EntrepriseDto updateDto = new EntrepriseDto();
            updateDto.setNom(nom);
            updateDto.setSiret(siret);
            updateDto.setSecteur(secteur);

            // Appeler le service pour mettre à jour l'entreprise
            EntrepriseDto updatedEntreprise = entrepriseService.updateEntrepriseWithFiles(id, updateDto, photoFile, logoFile);
            return ResponseEntity.ok(updatedEntreprise);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Supprime une entreprise par son identifiant.
     * Endpoint: DELETE /api/v1/entreprises/{id}
     * @param id L'ID de l'entreprise à supprimer.
     * @return Une réponse avec un statut HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteEntreprise(@PathVariable Long id) {
        try {
            entrepriseService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }
}
