package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.dto.UtilisateurDto;
import com.groupe.gestionDesStages.dto.serviceDto.RegisterRequestDto;
import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.service.serviceImpl.UtilisateurServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurServiceImpl utilisateurService;


    /**
     * Récupère un utilisateur par son ID.
     * Accessible uniquement par un administrateur ou l'utilisateur lui-même.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UtilisateurDto> findUserById(@PathVariable Long id) {
        try {
            UtilisateurDto user = utilisateurService.findUserById(id);
            return ResponseEntity.ok(user);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère un utilisateur par son email.
     * Accessible uniquement par un administrateur.
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilisateurDto> findUserByEmail(@PathVariable String email) {
        try {
            UtilisateurDto user = utilisateurService.findUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère tous les utilisateurs.
     * Accessible uniquement par un administrateur.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UtilisateurDto>> findAllUsers() {
        List<UtilisateurDto> users = utilisateurService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Met à jour un utilisateur.
     * Accessible uniquement par un administrateur ou l'utilisateur lui-même.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<Utilisateur> updateUtilisateur(@PathVariable Long id, @RequestBody @Valid UtilisateurDto utilisateurDto) {
        // S'assurer que l'ID dans le DTO correspond à l'ID du chemin
        utilisateurDto.setId(id);
        try {
            Utilisateur updatedUser = utilisateurService.updateUtilisateur(utilisateurDto);
            return ResponseEntity.ok(updatedUser);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Supprime un utilisateur.
     * Accessible uniquement par un administrateur.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable Long id) {
        try {
            utilisateurService.deleteUtilisateur(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }
}
