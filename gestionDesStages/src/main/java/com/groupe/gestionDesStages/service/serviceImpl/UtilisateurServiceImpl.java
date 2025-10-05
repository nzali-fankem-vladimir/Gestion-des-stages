package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.UtilisateurDto;
import com.groupe.gestionDesStages.dto.serviceDto.RegisterRequestDto;
import com.groupe.gestionDesStages.models.Role;
import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.repository.RoleRepository;
import com.groupe.gestionDesStages.repository.UtilisateurRepository;
import com.groupe.gestionDesStages.service.UtilisateurService;
import com.groupe.gestionDesStages.validator.ObjectValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilisateurServiceImpl implements UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectValidator<UtilisateurDto> validator;

    @Override
    @Transactional
    public Utilisateur registerUtilisateur(RegisterRequestDto request) {
        // Transformer RegisterRequestDto en UtilisateurDto pour la validation
        UtilisateurDto utilisateurDto = UtilisateurDto.builder()
                .email(request.getEmail())
                .motDePasse(request.getMotDePasse())
                .role(null) // le rôle sera affecté après récupération depuis la BDD
                .build();

        // Validation
        validator.validate(utilisateurDto);

        Utilisateur utilisateur = request.toUtilisateur();

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new EntityNotFoundException("Rôle introuvable : " + request.getRole()));

        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        utilisateur.setRole(role);
        
        // Les nouveaux utilisateurs sont inactifs par défaut, sauf les admins
        if (request.getRole() == com.groupe.gestionDesStages.models.enums.ERole.ADMIN) {
            utilisateur.setActif(true); // Les admins sont actifs immédiatement
        } else {
            utilisateur.setActif(false); // Les autres utilisateurs doivent être validés
        }

        return utilisateurRepository.save(utilisateur);
    }

    @Override
    public UtilisateurDto findUserById(Long id) {
        return utilisateurRepository.findById(id)
                .map(UtilisateurDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable avec id : " + id));
    }

    @Override
    public UtilisateurDto findUserByEmail(String email) {
        return utilisateurRepository.findByEmail(email)
                .map(UtilisateurDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable avec email : " + email));
    }

    @Override
    public List<UtilisateurDto> findAllUsers() {
        return utilisateurRepository.findAll()
                .stream()
                .map(UtilisateurDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Utilisateur updateUtilisateur(UtilisateurDto utilisateurDto) {
        // Validation
        validator.validate(utilisateurDto);

        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurDto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable avec id : " + utilisateurDto.getId()));

        utilisateur.setEmail(utilisateurDto.getEmail());
        utilisateur.setPhotoProfil(utilisateurDto.getPhotoProfil());

        if (utilisateurDto.getMotDePasse() != null && !utilisateurDto.getMotDePasse().isBlank()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(utilisateurDto.getMotDePasse()));
        }

        return utilisateurRepository.save(utilisateur);
    }

    @Override
    public List<UtilisateurDto> findUsersByRole(com.groupe.gestionDesStages.models.enums.ERole role) {
        return utilisateurRepository.findByRole_Name(role)
                .stream()
                .map(UtilisateurDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByEmail(String email) {
        return utilisateurRepository.findByEmail(email).isPresent();
    }

    @Override
    @Transactional
    public void deleteUtilisateur(Long id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new EntityNotFoundException("Utilisateur introuvable avec id : " + id);
        }
        utilisateurRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Utilisateur activateUser(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable avec id : " + id));
        
        utilisateur.setActif(true);
        return utilisateurRepository.save(utilisateur);
    }

    @Override
    @Transactional
    public Utilisateur deactivateUser(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable avec id : " + id));
        
        utilisateur.setActif(false);
        return utilisateurRepository.save(utilisateur);
    }

    @Override
    public List<UtilisateurDto> findPendingUsers() {
        return utilisateurRepository.findByActif(false)
                .stream()
                .map(UtilisateurDto::fromEntity)
                .collect(Collectors.toList());
    }
}
