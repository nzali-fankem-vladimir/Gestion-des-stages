package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.dto.OffreDto;
import com.groupe.gestionDesStages.models.Entreprise;
import com.groupe.gestionDesStages.models.Offre;
import com.groupe.gestionDesStages.repository.EntrepriseRepository;
import com.groupe.gestionDesStages.repository.OffreRepository;
import com.groupe.gestionDesStages.service.IOffreService;
import com.groupe.gestionDesStages.validator.ObjectValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OffreServiceImpl implements IOffreService {

    private final OffreRepository offreRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final ObjectValidator<OffreDto> validator;

    @Value("${file.upload-dir}") // Définissez ce chemin dans votre application.properties
    private String uploadDir;

    @Override
    @Transactional
    public OffreDto createOffre(OffreDto offreDto, MultipartFile file) {
        validator.validate(offreDto);

        Entreprise entreprise = entrepriseRepository.findById(offreDto.getEntrepriseId())
                .orElseThrow(() -> new EntityNotFoundException("Entreprise introuvable avec id : " + offreDto.getEntrepriseId()));

        // Gérer le téléchargement du fichier
        if (file != null && !file.isEmpty()) {
            try {
                // Créer le répertoire s'il n'existe pas
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // Générer un nom de fichier unique
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);

                // Enregistrer le fichier
                Files.copy(file.getInputStream(), filePath);

                // Mettre à jour le DTO avec le chemin du fichier
                offreDto.setFichierOffre(filePath.toString());
            } catch (IOException e) {
                // Gérer les erreurs de téléchargement
                throw new RuntimeException("Échec de l'enregistrement du fichier", e);
            }
        } else {
            // Si aucun fichier n'est fourni, assurez-vous que le chemin est nul
            offreDto.setFichierOffre(null);
        }

        Offre offre = offreDto.toEntity(entreprise);
        Offre savedOffre = offreRepository.save(offre);
        return OffreDto.fromEntity(savedOffre);
    }

    @Override
    public OffreDto findOffreById(Long id) {
        return offreRepository.findById(id)
                .map(OffreDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Offre introuvable avec id : " + id));
    }

    @Override
    public List<OffreDto> findAllOffres() {
        return offreRepository.findAll()
                .stream()
                .map(OffreDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OffreDto updateOffre(Long id, OffreDto offreDto, MultipartFile file) {
        Offre existingOffre = offreRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Offre introuvable avec id : " + id));

        // Mettre à jour chaque champ uniquement s'il n'est pas null dans le DTO
        if (StringUtils.hasText(offreDto.getTitre())) {
            existingOffre.setTitre(offreDto.getTitre());
        }
        if (StringUtils.hasText(offreDto.getDescription())) {
            existingOffre.setDescription(offreDto.getDescription());
        }
        if (offreDto.getDuree() != null) {
            existingOffre.setDuree(offreDto.getDuree());
        }
        if (StringUtils.hasText(offreDto.getLieu())) {
            existingOffre.setLieu(offreDto.getLieu());
        }
        if (StringUtils.hasText(offreDto.getDomaine())) {
            existingOffre.setDomaine(offreDto.getDomaine());
        }
        if (offreDto.getCompetences() != null) {
            existingOffre.setCompetences(offreDto.getCompetences());
        }
        if (offreDto.getAvantages() != null) {
            existingOffre.setAvantages(offreDto.getAvantages());
        }
        if (offreDto.getDateDebut() != null) {
            existingOffre.setDateDebut(offreDto.getDateDebut());
        }
        if (offreDto.getDateFin() != null) {
            existingOffre.setDateFin(offreDto.getDateFin());
        }
        if (offreDto.getDateLimiteCandidature() != null) {
            existingOffre.setDateLimiteCandidature(offreDto.getDateLimiteCandidature());
        }
        if (offreDto.getEstActive() != null) {
            existingOffre.setEstActive(offreDto.getEstActive());
        }
        // Mise à jour de l'entreprise si l'ID est fourni dans le DTO
        if (offreDto.getEntrepriseId() != null) {
            Entreprise entreprise = entrepriseRepository.findById(offreDto.getEntrepriseId())
                    .orElseThrow(() -> new EntityNotFoundException("Entreprise introuvable avec id : " + offreDto.getEntrepriseId()));
            existingOffre.setEntreprise(entreprise);
        }

        // Gérer le téléchargement du nouveau fichier avec la même logique que createOffre
        if (file != null && !file.isEmpty()) {
            try {
                // Supprimer l'ancien fichier s'il existe
                if (existingOffre.getFichierOffre() != null) {
                    Path oldFilePath = Paths.get(uploadDir).resolve(existingOffre.getFichierOffre());
                    if (Files.exists(oldFilePath)) {
                        Files.delete(oldFilePath);
                    }
                }

                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath);

                // Enregistrer SEULEMENT le nom du fichier dans la base de données
                existingOffre.setFichierOffre(fileName);

            } catch (IOException e) {
                throw new RuntimeException("Échec de l'enregistrement du fichier", e);
            }
        }

        Offre updatedOffre = offreRepository.save(existingOffre);
        return OffreDto.fromEntity(updatedOffre);
    }


    @Override
    public List<OffreDto> findByEntrepriseId(Long entrepriseId) {
        return offreRepository.findByEntrepriseId(entrepriseId)
                .stream()
                .map(OffreDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteOffre(Long id) {
        if (!offreRepository.existsById(id)) {
            throw new EntityNotFoundException("Offre introuvable avec id : " + id);
        }
        offreRepository.deleteById(id);
    }
}
