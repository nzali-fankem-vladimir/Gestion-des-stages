package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.EtudiantDto;
import com.groupe.gestionDesStages.models.Etudiant;
import com.groupe.gestionDesStages.models.Role;
import com.groupe.gestionDesStages.models.enums.ERole;
import com.groupe.gestionDesStages.repository.EtudiantRepository;
import com.groupe.gestionDesStages.repository.RoleRepository;
import com.groupe.gestionDesStages.service.IFileService;
import com.groupe.gestionDesStages.service.IEtudiantService;
import com.groupe.gestionDesStages.validator.ObjectValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EtudiantServiceImpl implements IEtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final RoleRepository roleRepository;
    private final ObjectValidator<EtudiantDto> validator;
    private final IFileService fileService;

    @Override
    @Transactional
    public EtudiantDto createEtudiant(EtudiantDto etudiantDto) {
        validator.validate(etudiantDto);

        Role role = roleRepository.findByName(ERole.ETUDIANT)
                .orElseThrow(() -> new EntityNotFoundException("Rôle Etudiant introuvable"));

        Etudiant etudiant = etudiantDto.toEntity(role);
        Etudiant savedEtudiant = etudiantRepository.save(etudiant);
        return EtudiantDto.fromEntity(savedEtudiant);
    }

    @Override
    public EtudiantDto findById(Long id) {
        return etudiantRepository.findById(id)
                .map(EtudiantDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Étudiant introuvable avec l'id : " + id));
    }

    @Override
    public List<EtudiantDto> findAll() {
        return etudiantRepository.findAll()
                .stream()
                .map(EtudiantDto::fromEntity)
                .toList();
    }

    @Override
    public EtudiantDto findByEmail(String email) {
        return etudiantRepository.findByEmail(email)
                .map(EtudiantDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Étudiant introuvable avec l'email : " + email));
    }

    @Override
    public EtudiantDto findByMatricule(String matricule) {
        return etudiantRepository.findByMatricule(matricule)
                .stream()
                .findFirst()
                .map(EtudiantDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Étudiant introuvable avec le matricule : " + matricule));
    }

    @Override
    public List<EtudiantDto> findByNomAndFiliere(String nom, String filiere) {
        return etudiantRepository.findByNomAndFiliere(nom, filiere)
                .stream()
                .map(EtudiantDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public EtudiantDto updateEtudiantWithFiles(Long id, EtudiantDto etudiantDto, MultipartFile photoFile, MultipartFile cvFile) throws IOException {
        Etudiant existingEtudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Étudiant introuvable avec l'id : " + id));

        // Mettre à jour les champs si les valeurs ne sont pas nulles
        if (etudiantDto.getNom() != null) {
            existingEtudiant.setNom(etudiantDto.getNom());
        }
        if (etudiantDto.getPrenom() != null) {
            existingEtudiant.setPrenom(etudiantDto.getPrenom());
        }
        if (etudiantDto.getMatricule() != null) {
            existingEtudiant.setMatricule(etudiantDto.getMatricule());
        }
        if (etudiantDto.getFiliere() != null) {
            existingEtudiant.setFiliere(etudiantDto.getFiliere());
        }

        // Gérer le téléchargement de la nouvelle photo de profil
        if (photoFile != null && !photoFile.isEmpty()) {
            String newPhotoPath = fileService.storeFileInCategory(photoFile, "profile");
            existingEtudiant.setPhotoProfil(newPhotoPath);
        }

        // Gérer le téléchargement du nouveau CV
        if (cvFile != null && !cvFile.isEmpty()) {
            String newCvPath = fileService.storeFileInCategory(cvFile, "document");
            existingEtudiant.setCvFile(newCvPath);
        }

        Etudiant updatedEtudiant = etudiantRepository.save(existingEtudiant);
        return EtudiantDto.fromEntity(updatedEtudiant);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!etudiantRepository.existsById(id)) {
            throw new EntityNotFoundException("Étudiant introuvable avec l'id : " + id);
        }
        etudiantRepository.deleteById(id);
    }
}
