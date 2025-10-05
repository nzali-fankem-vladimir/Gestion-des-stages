package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.CandidatureDto;
import com.groupe.gestionDesStages.models.Candidature;
import com.groupe.gestionDesStages.models.Etudiant;
import com.groupe.gestionDesStages.models.Offre;
import com.groupe.gestionDesStages.models.enums.StatutCandidature;
import com.groupe.gestionDesStages.repository.CandidatureRepository;
import com.groupe.gestionDesStages.repository.EtudiantRepository;
import com.groupe.gestionDesStages.repository.OffreRepository;
import com.groupe.gestionDesStages.service.ICandidatureService;
import com.groupe.gestionDesStages.validator.ObjectValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidatureServiceImpl implements ICandidatureService {

    private final CandidatureRepository candidatureRepository;
    private final EtudiantRepository etudiantRepository;
    private final OffreRepository offreRepository;
    private final ObjectValidator<CandidatureDto> validator;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    @Transactional
    public CandidatureDto createCandidature(CandidatureDto candidatureDto, MultipartFile cvFile, MultipartFile lettreMotivationFile) {
        validator.validate(candidatureDto);

        Etudiant etudiant = etudiantRepository.findById(candidatureDto.getEtudiantId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Étudiant introuvable avec id : " + candidatureDto.getEtudiantId()));

        Offre offre = offreRepository.findById(candidatureDto.getOffreId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Offre introuvable avec id : " + candidatureDto.getOffreId()));

        Candidature candidature = CandidatureDto.toEntity(candidatureDto, etudiant, offre);
        candidature.setDateCandidature(LocalDate.now());

        if (cvFile != null && !cvFile.isEmpty()) {
            try {
                String uniqueFileName = UUID.randomUUID().toString() + "_" + cvFile.getOriginalFilename();
                Path uploadPath = Paths.get(uploadDir);
                Path filePath = uploadPath.resolve(uniqueFileName);

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.copy(cvFile.getInputStream(), filePath);
                candidature.setCvUrl(uniqueFileName);
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de l'enregistrement du CV", e);
            }
        } else {
            // Optionnel: si pas de fichier, on peut décider de prendre le CV de l'étudiant s'il existe
            candidature.setCvUrl(etudiant.getCvFile());
        }

        // Gestion upload Lettre de motivation: stocker uniquement le nom du fichier
        if (lettreMotivationFile != null && !lettreMotivationFile.isEmpty()) {
            try {
                String lmUniqueFileName = "LM_" + UUID.randomUUID() + "_" + lettreMotivationFile.getOriginalFilename();
                Path uploadPath = Paths.get(uploadDir);
                Path lmPath = uploadPath.resolve(lmUniqueFileName);

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.copy(lettreMotivationFile.getInputStream(), lmPath);
                candidature.setLettreMotivation(lmUniqueFileName);
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de l'enregistrement de la lettre de motivation", e);
            }
        } else {
            // Si aucun fichier fourni, conserver la valeur éventuelle du DTO (ou null)
            candidature.setLettreMotivation(candidature.getLettreMotivation());
        }

        Candidature savedCandidature = candidatureRepository.save(candidature);
        return CandidatureDto.fromEntity(savedCandidature);
    }

    @Override
    public CandidatureDto findById(Long id) {
        return candidatureRepository.findById(id)
                .map(CandidatureDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Candidature introuvable avec id : " + id));
    }

    @Override
    public List<CandidatureDto> findAll() {
        return candidatureRepository.findAll()
                .stream()
                .map(CandidatureDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<CandidatureDto> findByEtudiantId(Long etudiantId) {
        return candidatureRepository.findByEtudiantId(etudiantId)
                .stream()
                .map(CandidatureDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<CandidatureDto> findByOffreId(Long offreId) {
        return candidatureRepository.findByOffreId(offreId)
                .stream()
                .map(CandidatureDto::fromEntity)
                .collect(Collectors.toList());
    }


    @Override
    public List<CandidatureDto> findByEntrepriseId(Long entrepriseId) {
        return candidatureRepository.findByEntrepriseId(entrepriseId)
                .stream()
                .map(CandidatureDto::fromEntity)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public CandidatureDto updateCandidature(Long id, CandidatureDto candidatureDto, MultipartFile cvFile) {
        return candidatureRepository.findById(id).map(existingCandidature -> {
            // Mettre à jour les champs
            if (candidatureDto.getStatut() != null) {
                existingCandidature.setStatut(StatutCandidature.valueOf(candidatureDto.getStatut()));
            }
            if (candidatureDto.getLettreMotivation() != null) {
                existingCandidature.setLettreMotivation(candidatureDto.getLettreMotivation());
            }
            if (candidatureDto.isLuParEntreprise() != existingCandidature.isLuParEntreprise()) {
                existingCandidature.setLuParEntreprise(candidatureDto.isLuParEntreprise());
            }

            // Gérer la mise à jour du fichier CV
            if (cvFile != null && !cvFile.isEmpty()) {
                try {
                    // Supprimer l'ancien CV s'il existe
                    if (existingCandidature.getCvUrl() != null) {
                        Path oldCvPath = Paths.get(uploadDir).resolve(existingCandidature.getCvUrl());
                        if (Files.exists(oldCvPath)) {
                            Files.delete(oldCvPath);
                        }
                    }

                    String uniqueFileName = UUID.randomUUID().toString() + "_" + cvFile.getOriginalFilename();
                    Path uploadPath = Paths.get(uploadDir);
                    Path filePath = uploadPath.resolve(uniqueFileName);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }
                    Files.copy(cvFile.getInputStream(), filePath);
                    existingCandidature.setCvUrl(uniqueFileName);

                } catch (IOException e) {
                    throw new RuntimeException("Erreur lors de la mise à jour du CV", e);
                }
            } else if (candidatureDto.getCvUrl() == null) {
                // Si le DTO envoie un cvUrl null, cela peut signifier que l'utilisateur souhaite supprimer le CV.
                if (existingCandidature.getCvUrl() != null) {
                    try {
                        Path oldCvPath = Paths.get(uploadDir).resolve(existingCandidature.getCvUrl());
                        if (Files.exists(oldCvPath)) {
                            Files.delete(oldCvPath);
                        }
                        existingCandidature.setCvUrl(null);
                    } catch (IOException e) {
                        throw new RuntimeException("Erreur lors de la suppression du CV", e);
                    }
                }
            }

            Candidature updatedCandidature = candidatureRepository.save(existingCandidature);
            return CandidatureDto.fromEntity(updatedCandidature);
        }).orElseThrow(() -> new EntityNotFoundException("Candidature introuvable avec id : " + id));
    }


    @Override
    @Transactional
    public CandidatureDto updateCandidatureWithFields(Long id, CandidatureDto updateDto, MultipartFile cvFile) throws IOException {
        return candidatureRepository.findById(id).map(existingCandidature -> {
            // Mettre à jour uniquement les champs fournis (non null)
            if (updateDto.getStatut() != null && !updateDto.getStatut().trim().isEmpty()) {
                try {
                    existingCandidature.setStatut(StatutCandidature.valueOf(updateDto.getStatut()));
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Statut invalide : " + updateDto.getStatut());
                }
            }
            
            if (updateDto.getLettreMotivation() != null) {
                existingCandidature.setLettreMotivation(updateDto.getLettreMotivation());
            }
            
            // Pour luParEntreprise, on vérifie si la valeur a été explicitement définie
            if (updateDto.isLuParEntreprise() != existingCandidature.isLuParEntreprise()) {
                existingCandidature.setLuParEntreprise(updateDto.isLuParEntreprise());
            }

            // Gérer la mise à jour du fichier CV
            if (cvFile != null && !cvFile.isEmpty()) {
                try {
                    // Supprimer l'ancien CV s'il existe
                    if (existingCandidature.getCvUrl() != null) {
                        Path oldCvPath = Paths.get(uploadDir).resolve(existingCandidature.getCvUrl());
                        if (Files.exists(oldCvPath)) {
                            Files.delete(oldCvPath);
                        }
                    }

                    String uniqueFileName = UUID.randomUUID().toString() + "_" + cvFile.getOriginalFilename();
                    Path uploadPath = Paths.get(uploadDir);
                    Path filePath = uploadPath.resolve(uniqueFileName);
                    
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }
                    
                    Files.copy(cvFile.getInputStream(), filePath);
                    existingCandidature.setCvUrl(uniqueFileName);

                } catch (IOException e) {
                    throw new RuntimeException("Erreur lors de la mise à jour du CV : " + e.getMessage(), e);
                }
            }

            Candidature updatedCandidature = candidatureRepository.save(existingCandidature);
            return CandidatureDto.fromEntity(updatedCandidature);
        }).orElseThrow(() -> new EntityNotFoundException("Candidature introuvable avec id : " + id));
    }


    @Override
    @Transactional
    public void deleteById(Long id) {
        Optional<Candidature> candidature = candidatureRepository.findById(id);
        if (candidature.isPresent()) {
            if (candidature.get().getCvUrl() != null) {
                try {
                    Path cvPath = Paths.get(uploadDir).resolve(candidature.get().getCvUrl());
                    if (Files.exists(cvPath)) {
                        Files.delete(cvPath);
                    }
                } catch (IOException e) {
                    throw new RuntimeException("Erreur lors de la suppression du fichier CV", e);
                }
            }
            candidatureRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("Candidature introuvable avec id : " + id);
        }
    }
}
