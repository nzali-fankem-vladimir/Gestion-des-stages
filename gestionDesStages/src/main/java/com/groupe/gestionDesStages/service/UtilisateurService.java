package com.groupe.gestionDesStages.service;


import com.groupe.gestionDesStages.dto.UtilisateurDto;
import com.groupe.gestionDesStages.dto.serviceDto.RegisterRequestDto;
import com.groupe.gestionDesStages.models.Utilisateur;
import com.groupe.gestionDesStages.models.enums.ERole;

import java.util.List;

public interface UtilisateurService {

    Utilisateur registerUtilisateur(RegisterRequestDto request);

    UtilisateurDto findUserById(Long id);

    UtilisateurDto findUserByEmail(String email);

    List<UtilisateurDto> findAllUsers();

    List<UtilisateurDto> findUsersByRole(ERole role);

    Utilisateur updateUtilisateur(UtilisateurDto utilisateurDto);

    void deleteUtilisateur(Long id);

    boolean existsByEmail(String email);

    Utilisateur activateUser(Long id);

    Utilisateur deactivateUser(Long id);

    List<UtilisateurDto> findPendingUsers();

}