package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.dto.UtilisateurDto;
import com.groupe.gestionDesStages.dto.serviceDto.RegisterRequestDto;
import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.models.enums.ERole;
import com.groupe.gestionDesStages.service.UtilisateurService;
import com.groupe.gestionDesStages.service.IRoleService;
import com.groupe.gestionDesStages.service.IStatisticsService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final UtilisateurService utilisateurService;
    private final IRoleService roleService;
    private final IStatisticsService statisticsService;

    /**
     * Endpoint de test pour vérifier que le contrôleur fonctionne
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("AdminController fonctionne !");
    }

    /**
     * Récupère tous les utilisateurs
     */
    @GetMapping("/users")
    public ResponseEntity<List<UtilisateurDto>> getAllUsers() {
        List<UtilisateurDto> users = utilisateurService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Récupère un utilisateur par son ID
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<UtilisateurDto> getUserById(@PathVariable Long id) {
        try {
            UtilisateurDto user = utilisateurService.findUserById(id);
            return ResponseEntity.ok(user);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Crée un nouvel utilisateur (admin avec rôles limités)
     */
    @PostMapping("/users")
    public ResponseEntity<UtilisateurDto> createUser(
            @RequestBody @Valid RegisterRequestDto request,
            Authentication authentication) {
        try {
            // Vérifier que le rôle demandé est autorisé
            if (!isRoleAllowed(request.getRole())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Rôle non autorisé. Rôles autorisés: ETUDIANT, ENSEIGNANT, ENTREPRISE");
            }

            Utilisateur createdUser = utilisateurService.registerUtilisateur(request);
            UtilisateurDto userDto = utilisateurService.findUserById(createdUser.getId());
            return new ResponseEntity<>(userDto, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    /**
     * Met à jour un utilisateur
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<UtilisateurDto> updateUser(
            @PathVariable Long id,
            @RequestBody @Valid UtilisateurDto utilisateurDto,
            Authentication authentication) {
        try {
            utilisateurDto.setId(id);
            Utilisateur updatedUser = utilisateurService.updateUtilisateur(utilisateurDto);
            UtilisateurDto userDto = utilisateurService.findUserById(updatedUser.getId());
            return ResponseEntity.ok(userDto);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Supprime un utilisateur
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            // Empêcher la suppression de son propre compte
            UtilisateurDto currentUser = utilisateurService.findUserByEmail(authentication.getName());
            if (currentUser.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Vous ne pouvez pas supprimer votre propre compte");
            }

            utilisateurService.deleteUtilisateur(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère les statistiques globales
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getGlobalStatistics() {
        Map<String, Object> statistics = statisticsService.getGlobalStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * Récupère les statistiques des utilisateurs par rôle
     */
    @GetMapping("/users/statistics")
    public ResponseEntity<Map<String, Long>> getUserStatistics() {
        Map<String, Long> statistics = statisticsService.getUserStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * Active un utilisateur
     */
    @PutMapping("/users/{id}/activate")
    public ResponseEntity<UtilisateurDto> activateUser(@PathVariable Long id) {
        try {
            Utilisateur user = utilisateurService.activateUser(id);
            UtilisateurDto userDto = utilisateurService.findUserById(user.getId());
            return ResponseEntity.ok(userDto);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Désactive un utilisateur
     */
    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<UtilisateurDto> deactivateUser(@PathVariable Long id) {
        try {
            Utilisateur user = utilisateurService.deactivateUser(id);
            UtilisateurDto userDto = utilisateurService.findUserById(user.getId());
            return ResponseEntity.ok(userDto);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère les utilisateurs en attente de validation
     */
    @GetMapping("/users/pending")
    public ResponseEntity<List<UtilisateurDto>> getPendingUsers() {
        List<UtilisateurDto> pendingUsers = utilisateurService.findPendingUsers();
        return ResponseEntity.ok(pendingUsers);
    }

    /**
     * Vérifie si un rôle est autorisé pour la création par un admin
     */
    private boolean isRoleAllowed(ERole role) {
        // Un admin peut créer des utilisateurs avec les rôles suivants (pas d'autres admins)
        return role == ERole.ETUDIANT || role == ERole.ENSEIGNANT || role == ERole.ENTREPRISE;
    }
}
