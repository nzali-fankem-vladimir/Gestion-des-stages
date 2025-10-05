package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.dto.ConventionDto;
import com.groupe.gestionDesStages.service.serviceImpl.ConventionServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conventions")
@RequiredArgsConstructor
public class ConventionController {

    private final ConventionServiceImpl conventionService;


    @PostMapping
    public ResponseEntity<ConventionDto> createConvention(@RequestBody @Valid ConventionDto conventionDto) {
        try {
            ConventionDto createdConvention = conventionService.createConvention(conventionDto);
            return new ResponseEntity<>(createdConvention, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<ConventionDto> findById(@PathVariable Long id) {
        try {
            ConventionDto convention = conventionService.findById(id);
            return ResponseEntity.ok(convention);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }


    @GetMapping("/all")
    public ResponseEntity<List<ConventionDto>> findAll() {
        List<ConventionDto> conventions = conventionService.findAll();
        return ResponseEntity.ok(conventions);
    }


    @PutMapping("/{id}")
    public ResponseEntity<ConventionDto> updateConvention(@PathVariable Long id, @RequestBody @Valid ConventionDto conventionDto) {
        try {
            ConventionDto updatedConvention = conventionService.updateConvention(id, conventionDto);
            return ResponseEntity.ok(updatedConvention);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConvention(@PathVariable Long id) {
        try {
            conventionService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    // Endpoints pour les étudiants
    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<List<ConventionDto>> getConventionsByEtudiant(@PathVariable Long etudiantId) {
        System.out.println("=== RÉCUPÉRATION CONVENTIONS ÉTUDIANT ===");
        System.out.println("Étudiant ID: " + etudiantId);
        
        try {
            List<ConventionDto> conventions = conventionService.findByEtudiantId(etudiantId);
            System.out.println("Conventions trouvées: " + conventions.size());
            return ResponseEntity.ok(conventions);
        } catch (Exception e) {
            System.err.println("Erreur récupération conventions étudiant: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), e);
        }
    }

    // Endpoints pour les enseignants
    @GetMapping("/enseignant/all")
    public ResponseEntity<List<ConventionDto>> getAllConventionsForEnseignant() {
        System.out.println("=== RÉCUPÉRATION TOUTES CONVENTIONS POUR ENSEIGNANT ===");
        
        try {
            List<ConventionDto> conventions = conventionService.findAll();
            System.out.println("Conventions trouvées: " + conventions.size());
            return ResponseEntity.ok(conventions);
        } catch (Exception e) {
            System.err.println("Erreur récupération conventions enseignant: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), e);
        }
    }

    @GetMapping("/enseignant/{enseignantId}")
    public ResponseEntity<List<ConventionDto>> getConventionsByEnseignant(@PathVariable Long enseignantId) {
        System.out.println("=== RÉCUPÉRATION CONVENTIONS ENSEIGNANT ===");
        System.out.println("Enseignant ID: " + enseignantId);
        
        try {
            List<ConventionDto> conventions = conventionService.findByEnseignantId(enseignantId);
            System.out.println("Conventions trouvées: " + conventions.size());
            return ResponseEntity.ok(conventions);
        } catch (Exception e) {
            System.err.println("Erreur récupération conventions enseignant: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), e);
        }
    }

    // Actions de validation/rejet par l'enseignant
    @PutMapping("/{id}/validate")
    public ResponseEntity<ConventionDto> validateConvention(@PathVariable Long id, @RequestBody(required = false) String commentaires) {
        System.out.println("=== VALIDATION CONVENTION ===");
        System.out.println("Convention ID: " + id);
        System.out.println("Commentaires: " + commentaires);
        
        try {
            ConventionDto validatedConvention = conventionService.validateConvention(id, commentaires);
            System.out.println("Convention validée avec succès");
            return ResponseEntity.ok(validatedConvention);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("Erreur validation convention: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), e);
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ConventionDto> rejectConvention(@PathVariable Long id, @RequestBody(required = false) String reason) {
        System.out.println("=== REJET CONVENTION ===");
        System.out.println("Convention ID: " + id);
        System.out.println("Raison: " + reason);
        
        try {
            ConventionDto rejectedConvention = conventionService.rejectConvention(id, reason);
            System.out.println("Convention rejetée avec succès");
            return ResponseEntity.ok(rejectedConvention);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("Erreur rejet convention: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), e);
        }
    }
}
