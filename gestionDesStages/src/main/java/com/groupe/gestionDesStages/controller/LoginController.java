package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.dto.LoginResponseDto;
import com.groupe.gestionDesStages.dto.serviceDto.LoginRequestDto;
import com.groupe.gestionDesStages.dto.serviceDto.RegisterRequestDto;
import com.groupe.gestionDesStages.service.ILoginService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class LoginController {

    private final ILoginService loginService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDto> register(@RequestBody @Valid RegisterRequestDto request) {
        return ResponseEntity.ok(loginService.register(request));
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody @Valid LoginRequestDto request) {
        return ResponseEntity.ok(loginService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponseDto> getCurrentUser(Authentication authentication) {
        System.out.println("=== ENDPOINT /auth/me APPELÉ ===");
        
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("Aucune authentification trouvée");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            String email = authentication.getName();
            System.out.println("Email de l'utilisateur authentifié: " + email);
            
            LoginResponseDto currentUser = loginService.getCurrentUser(email);
            System.out.println("Utilisateur trouvé: " + currentUser);
            
            return ResponseEntity.ok(currentUser);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération de l'utilisateur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<Void> validateSession(Authentication authentication) {
        System.out.println("=== ENDPOINT /auth/validate APPELÉ ===");
        
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("Session invalide");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        System.out.println("Session valide pour: " + authentication.getName());
        return ResponseEntity.ok().build();
    }
}
