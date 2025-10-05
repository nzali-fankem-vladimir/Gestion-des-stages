package com.groupe.gestionDesStages.service;

import com.groupe.gestionDesStages.dto.OffreDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IOffreService {
    OffreDto createOffre(OffreDto offreDto, MultipartFile file);
    OffreDto findOffreById(Long id);
    List<OffreDto> findAllOffres();
    OffreDto updateOffre(Long id, OffreDto offreDto, MultipartFile file);
    List<OffreDto> findByEntrepriseId(Long entrepriseId);
    void deleteOffre(Long id);
}
