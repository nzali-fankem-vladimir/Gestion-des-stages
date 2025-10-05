package com.groupe.gestionDesStages.service;

import com.groupe.gestionDesStages.dto.CandidatureDto;
import com.groupe.gestionDesStages.models.Candidature;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ICandidatureService {
    CandidatureDto createCandidature(CandidatureDto candidatureDto, MultipartFile cvFile, MultipartFile lettreMotivationFile);
    CandidatureDto findById(Long id);
    List<CandidatureDto> findAll();
    List<CandidatureDto> findByEtudiantId(Long etudiantId);
    List<CandidatureDto> findByOffreId(Long offreId);
    List<CandidatureDto> findByEntrepriseId(Long entrepriseId);


    @Transactional
    CandidatureDto updateCandidature(Long id, CandidatureDto candidatureDto, MultipartFile cvFile);

    CandidatureDto updateCandidatureWithFields(Long id, CandidatureDto updateDto, MultipartFile cvFile) throws IOException;

    void deleteById(Long id);
}
