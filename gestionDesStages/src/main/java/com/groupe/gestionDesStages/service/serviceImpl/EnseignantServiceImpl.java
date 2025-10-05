package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.EnseignantDto;
import com.groupe.gestionDesStages.models.enums.ERole;
import com.groupe.gestionDesStages.models.Enseignant;
import com.groupe.gestionDesStages.models.Role;
import com.groupe.gestionDesStages.repository.EnseignantRepository;
import com.groupe.gestionDesStages.repository.RoleRepository;
import com.groupe.gestionDesStages.service.IEnseignantService;
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
public class EnseignantServiceImpl implements IEnseignantService {

    private final EnseignantRepository enseignantRepository;
    private final RoleRepository roleRepository;
    private final ObjectValidator<EnseignantDto> validator;
    private final IFileService fileService;

    @Override
    @Transactional
    public EnseignantDto createEnseignant(EnseignantDto enseignantDto) {
        validator.validate(enseignantDto);

        Role role = roleRepository.findByName(ERole.ENSEIGNANT)
                .orElseThrow(() -> new EntityNotFoundException("Rôle Enseignant introuvable"));

        Enseignant enseignant = enseignantDto.toEntity(role);
        Enseignant savedEnseignant = enseignantRepository.save(enseignant);
        return EnseignantDto.fromEntity(savedEnseignant);
    }

    @Override
    public EnseignantDto findById(Long id) {
        return enseignantRepository.findById(id)
                .map(EnseignantDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Enseignant introuvable avec l'id : " + id));
    }

    @Override
    public List<EnseignantDto> findAll() {
        return enseignantRepository.findAll()
                .stream()
                .map(EnseignantDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public EnseignantDto findByEmail(String email) {
        Enseignant enseignant = enseignantRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Enseignant introuvable avec l'email : " + email));
        return EnseignantDto.fromEntity(enseignant);
    }

    @Override
    @Transactional
    public EnseignantDto updateEnseignantWithFiles(Long id, EnseignantDto enseignantDto, MultipartFile photoFile) {
        Enseignant existingEnseignant = enseignantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Enseignant introuvable avec l'id : " + id));

        // Mise à jour conditionnelle des champs
        if (enseignantDto.getNom() != null) {
            existingEnseignant.setNom(enseignantDto.getNom());
        }
        if (enseignantDto.getPrenom() != null) {
            existingEnseignant.setPrenom(enseignantDto.getPrenom());
        }
        if (enseignantDto.getDepartement() != null) {
            existingEnseignant.setDepartement(enseignantDto.getDepartement());
        }
        if (enseignantDto.getSpecialite() != null) {
            existingEnseignant.setSpecialite(enseignantDto.getSpecialite());
        }
        // Gérer le fichier photo s'il est fourni
        if (photoFile != null && !photoFile.isEmpty()) {
            String photoPath = fileService.storeFileInCategory(photoFile, "profile");
            existingEnseignant.setPhotoProfil(photoPath);
        }

        Enseignant updatedEnseignant = enseignantRepository.save(existingEnseignant);
        return EnseignantDto.fromEntity(updatedEnseignant);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!enseignantRepository.existsById(id)) {
            throw new EntityNotFoundException("Enseignant introuvable avec l'id : " + id);
        }
        enseignantRepository.deleteById(id);
    }
}
