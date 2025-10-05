package com.groupe.gestionDesStages.service;

import com.groupe.gestionDesStages.dto.EntrepriseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IEntrepriseService {
    EntrepriseDto createEntreprise(EntrepriseDto entrepriseDto);

    EntrepriseDto createEntrepriseWithFiles(EntrepriseDto entrepriseDto, MultipartFile logo, MultipartFile photo);

    EntrepriseDto findById(Long id);

    List<EntrepriseDto> findAll();

    EntrepriseDto findByEmail(String email);


    EntrepriseDto updateEntrepriseWithFiles(Long id, EntrepriseDto entrepriseDto, MultipartFile photoFile, MultipartFile logoFile);

    void deleteById(Long id);
}
