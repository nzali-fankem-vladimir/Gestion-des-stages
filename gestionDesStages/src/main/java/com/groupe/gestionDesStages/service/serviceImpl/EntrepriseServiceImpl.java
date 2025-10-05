package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.EntrepriseDto;
import com.groupe.gestionDesStages.models.enums.ERole;
import com.groupe.gestionDesStages.models.Entreprise;
import com.groupe.gestionDesStages.models.Role;
import com.groupe.gestionDesStages.repository.EntrepriseRepository;
import com.groupe.gestionDesStages.repository.RoleRepository;
import com.groupe.gestionDesStages.service.IEntrepriseService;
import com.groupe.gestionDesStages.service.IFileService;
import com.groupe.gestionDesStages.validator.ObjectValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EntrepriseServiceImpl implements IEntrepriseService {

    private final EntrepriseRepository entrepriseRepository;
    private final RoleRepository roleRepository;
    private final ObjectValidator<EntrepriseDto> validator;
    private final IFileService fileService;

    @Override
    @Transactional
    public EntrepriseDto createEntreprise(EntrepriseDto entrepriseDto) {
        validator.validate(entrepriseDto);

        Role role = roleRepository.findByName(ERole.ENTREPRISE)
                .orElseThrow(() -> new EntityNotFoundException("Rôle Entreprise introuvable"));

        Entreprise entreprise = entrepriseDto.toEntity(role);
        Entreprise savedEntreprise = entrepriseRepository.save(entreprise);
        return EntrepriseDto.fromEntity(savedEntreprise);
    }

    @Override
    @Transactional
    public EntrepriseDto createEntrepriseWithFiles(EntrepriseDto entrepriseDto, MultipartFile logo, MultipartFile photo) {
        validator.validate(entrepriseDto);

        // Sauvegarde des fichiers s'ils existent et mise a jour des URLs
        if (logo != null && !logo.isEmpty()) {
            entrepriseDto.setLogoUrl(fileService.storeFileInCategory(logo, "logo"));
        }
        if (photo != null && !photo.isEmpty()) {
            entrepriseDto.setPhotoProfil(fileService.storeFileInCategory(photo, "profile"));
        }

        Role role = roleRepository.findByName(ERole.ENTREPRISE)
                .orElseThrow(() -> new EntityNotFoundException("Rôle Entreprise introuvable"));

        Entreprise entreprise = entrepriseDto.toEntity(role);
        Entreprise savedEntreprise = entrepriseRepository.save(entreprise);

        return EntrepriseDto.fromEntity(savedEntreprise);
    }

    @Override
    public EntrepriseDto findById(Long id) {
        return entrepriseRepository.findById(id)
                .map(EntrepriseDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Entreprise introuvable avec l'id : " + id));
    }

    @Override
    public List<EntrepriseDto> findAll() {
        return entrepriseRepository.findAll()
                .stream()
                .map(EntrepriseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public EntrepriseDto findByEmail(String email) {
        return entrepriseRepository.findByEmail(email)
                .map(EntrepriseDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Entreprise introuvable avec l'email : " + email));
    }

    @Override
    @Transactional
    public EntrepriseDto updateEntrepriseWithFiles(Long id, EntrepriseDto entrepriseDto, MultipartFile photoFile, MultipartFile logoFile) {
        Entreprise existingEntreprise = entrepriseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Entreprise introuvable avec l'id : " + id));

        if (entrepriseDto.getNom() != null) {
            existingEntreprise.setNom(entrepriseDto.getNom());
        }
        if (entrepriseDto.getSiret() != null) {
            existingEntreprise.setSiret(entrepriseDto.getSiret());
        }
        if (entrepriseDto.getSecteur() != null) {
            existingEntreprise.setSecteur(entrepriseDto.getSecteur());
        }
        if (entrepriseDto.getEmail() != null) {
            existingEntreprise.setEmail(entrepriseDto.getEmail());
        }

        // Gérer l'upload de nouveaux fichiers
        if (photoFile != null && !photoFile.isEmpty()) {
            existingEntreprise.setPhotoProfil(fileService.storeFileInCategory(photoFile, "profile"));
        }
        if (logoFile != null && !logoFile.isEmpty()) {
            existingEntreprise.setLogoUrl(fileService.storeFileInCategory(logoFile, "logo"));
        }

        // Sauvegarder l'entité mise à jour
        Entreprise updatedEntreprise = entrepriseRepository.save(existingEntreprise);

        return EntrepriseDto.fromEntity(updatedEntreprise);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!entrepriseRepository.existsById(id)) {
            throw new EntityNotFoundException("Entreprise introuvable avec l'id : " + id);
        }
        entrepriseRepository.deleteById(id);
    }
}
