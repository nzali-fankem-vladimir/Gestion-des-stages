package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.models.Role;
import com.groupe.gestionDesStages.models.enums.ERole;
import com.groupe.gestionDesStages.service.serviceImpl.RoleServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleServiceImpl roleService;

    /**
     * Récupère tous les rôles disponibles dans le système.
     * Accessible uniquement par un utilisateur avec le rôle 'ADMIN'.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Role>> getAllRoles() {
        try {
            List<Role> roles = roleService.getAllRoles();
            return ResponseEntity.ok(roles);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    /**
     * Récupère un rôle par son nom (par exemple, "ETUDIANT", "ENTREPRISE").
     * Accessible uniquement par un utilisateur avec le rôle 'ADMIN'.
     */
    @GetMapping("/name/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> getRoleByName(@PathVariable ERole name) {
        return roleService.findByName(name)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rôle introuvable avec le nom : " + name));
    }
}
