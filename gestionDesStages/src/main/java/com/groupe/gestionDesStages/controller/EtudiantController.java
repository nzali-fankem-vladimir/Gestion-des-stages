package com.groupe.gestionDesStages.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.groupe.gestionDesStages.dto.EtudiantDto;
import com.groupe.gestionDesStages.service.IFileService;
import com.groupe.gestionDesStages.service.IEtudiantService;
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
@RequestMapping("/api/v1/etudiants")
@RequiredArgsConstructor
public class EtudiantController {

    private final IEtudiantService etudiantService;
    private final IFileService fileService;
    private final ObjectMapper objectMapper;


    /**
     * Crée un nouvel étudiant avec la possibilité d'uploader une photo et un CV.
     * Accessible uniquement aux administrateurs.
     */
    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EtudiantDto> createEtudiant(
            @RequestPart("etudiant") String etudiantJson,
            @RequestPart(value = "photo", required = false) MultipartFile photoFile,
            @RequestPart(value = "cv", required = false) MultipartFile cvFile) {

        try {
            // 1. Désérialiser la partie JSON de la requête en un objet EtudiantDto
            EtudiantDto etudiantDto = objectMapper.readValue(etudiantJson, EtudiantDto.class);

            // 2. Gérer le téléchargement des fichiers
            //    Si un fichier photo est présent, le sauvegarder et mettre à jour le DTO
            if (photoFile != null && !photoFile.isEmpty()) {
                String photoPath = fileService.storeFile(photoFile);
                etudiantDto.setPhotoProfil(photoPath);
            }
            //    Si un fichier CV est présent, le sauvegarder et mettre à jour le DTO
            if (cvFile != null && !cvFile.isEmpty()) {
                String cvPath = fileService.storeFile(cvFile);
                etudiantDto.setCvFile(cvPath);
            }

            // 3. Appeler le service pour créer l'entité en base de données
            EtudiantDto createdEtudiant = etudiantService.createEtudiant(etudiantDto);
            return new ResponseEntity<>(createdEtudiant, HttpStatus.CREATED);

        } catch (IOException e) {
            // Gérer les erreurs de désérialisation JSON ou de sauvegarde des fichiers
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erreur lors du traitement de la requête: " + e.getMessage(), e);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }


    /**
     * Récupère un étudiant par son identifiant.
     * Accessible aux admins, aux étudiants eux-mêmes, aux entreprises et aux enseignants.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ETUDIANT') or hasAuthority('ENTREPRISE') or hasAuthority('ENSEIGNANT')")
    public ResponseEntity<EtudiantDto> findById(@PathVariable Long id, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            EtudiantDto etudiant = etudiantService.findById(id);

            boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ADMIN"));
            boolean isSameUser = userDetails.getUsername().equals(etudiant.getEmail());

            if (!isAdmin && !isSameUser) {
                // Pour éviter d'exposer l'existence d'un utilisateur, on peut retourner une 404
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé : Vous n'êtes pas autorisé à voir les informations de cet étudiant.");
            }

            return ResponseEntity.ok(etudiant);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère la liste de tous les étudiants.
     * Accessible uniquement aux administrateurs.
     */
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<EtudiantDto>> findAll() {
        List<EtudiantDto> etudiants = etudiantService.findAll();
        return ResponseEntity.ok(etudiants);
    }

    /**
     * Récupère un étudiant par son email.
     * Accessible uniquement aux administrateurs.
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ETUDIANT')")
    public ResponseEntity<EtudiantDto> findByEmail(@PathVariable String email) {
        try {
            EtudiantDto etudiant = etudiantService.findByEmail(email);
            return ResponseEntity.ok(etudiant);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère un étudiant par son matricule.
     * Accessible uniquement aux administrateurs.
     */
    @GetMapping("/matricule/{matricule}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ETUDIANT')")
    public ResponseEntity<EtudiantDto> findByMatricule(@PathVariable String matricule) {
        try {
            EtudiantDto etudiant = etudiantService.findByMatricule(matricule);
            return ResponseEntity.ok(etudiant);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère une liste d'étudiants par nom et filière.
     * Accessible uniquement aux administrateurs.
     */
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ETUDIANT')")
    public ResponseEntity<List<EtudiantDto>> findByNomAndFiliere(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String filiere) {
        List<EtudiantDto> etudiants = etudiantService.findByNomAndFiliere(nom, filiere);
        return ResponseEntity.ok(etudiants);
    }

    /**
     * Met à jour les informations d'un étudiant avec la possibilité d'uploader une photo et un CV.
     * Accessible aux administrateurs et aux étudiants eux-mêmes.
     */
    @PutMapping(path = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ETUDIANT')")
    public ResponseEntity<EtudiantDto> updateEtudiant(
            @PathVariable Long id,
            @RequestParam(value = "nom", required = false) String nom,
            @RequestParam(value = "prenom", required = false) String prenom,
            @RequestParam(value = "matricule", required = false) String matricule,
            @RequestParam(value = "filiere", required = false) String filiere,
            @RequestPart(value = "photo", required = false) MultipartFile photoFile,
            @RequestPart(value = "cv", required = false) MultipartFile cvFile,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            EtudiantDto existingEtudiant = etudiantService.findById(id);

            boolean isCurrentUserAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ADMIN"));

            if (!isCurrentUserAdmin && !userDetails.getUsername().equals(existingEtudiant.getEmail())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé : Vous n'êtes pas autorisé à modifier cet étudiant.");
            }

            // Créer un DTO temporaire pour passer les données au service
            EtudiantDto updateDto = new EtudiantDto();
            updateDto.setNom(nom);
            updateDto.setPrenom(prenom);
            updateDto.setMatricule(matricule);
            updateDto.setFiliere(filiere);

            EtudiantDto updatedEtudiant = etudiantService.updateEtudiantWithFiles(id, updateDto, photoFile, cvFile);
            return ResponseEntity.ok(updatedEtudiant);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erreur lors du traitement de la requête: " + e.getMessage(), e);
        }
    }


    /**
     * Supprime un étudiant.
     * Accessible uniquement aux administrateurs.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        try {
            etudiantService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }
}
