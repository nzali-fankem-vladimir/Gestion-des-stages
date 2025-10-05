package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.LoginResponseDto;
import com.groupe.gestionDesStages.dto.serviceDto.LoginRequestDto;
import com.groupe.gestionDesStages.dto.serviceDto.RegisterRequestDto;
import com.groupe.gestionDesStages.models.Role;
import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.repository.RoleRepository;
import com.groupe.gestionDesStages.repository.UtilisateurRepository;
import com.groupe.gestionDesStages.security.JwtService;
import com.groupe.gestionDesStages.service.ILoginService;
import com.groupe.gestionDesStages.validator.ObjectValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements ILoginService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ObjectValidator<RegisterRequestDto> registerValidator;
    private final ObjectValidator<LoginRequestDto> loginValidator;


    @Override
    @Transactional
    public LoginResponseDto register(RegisterRequestDto request) {
        registerValidator.validate(request);

        if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalStateException("L'email est déjà utilisé.");
        }


        Utilisateur utilisateur = request.toUtilisateur();


        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));


        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new IllegalStateException("Le rôle n'existe pas."));
        utilisateur.setRole(role);


        Utilisateur savedUtilisateur = utilisateurRepository.save(utilisateur);


        var jwtToken = jwtService.generateToken(savedUtilisateur);


        return LoginResponseDto.builder()
                .token(jwtToken)
                .id(savedUtilisateur.getId())
                .email(savedUtilisateur.getEmail())
                .role(savedUtilisateur.getRole().getName())
                .fullName(getFullName(savedUtilisateur))
                .avatarUrl(savedUtilisateur.getPhotoProfil())
                .build();
    }


    @Override
    public LoginResponseDto login(LoginRequestDto request) {
        loginValidator.validate(request);
        
        System.out.println("=== DEBUG LOGIN REQUEST ===");
        System.out.println("Email reçu: " + request.getEmail());
        System.out.println("Mot de passe reçu: " + request.getMotDePasse());
        System.out.println("============================");
        
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getMotDePasse()
                )
        );


        var user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("Utilisateur non trouvé."));
        var jwtToken = jwtService.generateToken(user);

        return LoginResponseDto.builder()
                .token(jwtToken)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .fullName(getFullName(user))
                .avatarUrl(user.getPhotoProfil())
                .build();
    }

    @Override
    public LoginResponseDto getCurrentUser(String email) {
        System.out.println("=== RÉCUPÉRATION UTILISATEUR ACTUEL ===");
        System.out.println("Email: " + email);
        
        var user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Utilisateur non trouvé."));
        
        System.out.println("Utilisateur trouvé: " + user.getEmail());
        System.out.println("Rôle: " + user.getRole().getName());
        
        return LoginResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .fullName(getFullName(user))
                .avatarUrl(user.getPhotoProfil())
                .build();
    }

    private String getFullName(Utilisateur user) {
        if (user instanceof com.groupe.gestionDesStages.models.Etudiant) {
            com.groupe.gestionDesStages.models.Etudiant etudiant = (com.groupe.gestionDesStages.models.Etudiant) user;
            return etudiant.getPrenom() + " " + etudiant.getNom();
        } else if (user instanceof com.groupe.gestionDesStages.models.Enseignant) {
            com.groupe.gestionDesStages.models.Enseignant enseignant = (com.groupe.gestionDesStages.models.Enseignant) user;
            return enseignant.getPrenom() + " " + enseignant.getNom();
        } else if (user instanceof com.groupe.gestionDesStages.models.Entreprise) {
            com.groupe.gestionDesStages.models.Entreprise entreprise = (com.groupe.gestionDesStages.models.Entreprise) user;
            return entreprise.getNom();
        } else if (user instanceof com.groupe.gestionDesStages.models.Admin) {
            return "Administrateur";
        }
        return user.getEmail();
    }
}
