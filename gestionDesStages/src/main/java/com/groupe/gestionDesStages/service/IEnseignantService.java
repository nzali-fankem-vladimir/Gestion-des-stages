package com.groupe.gestionDesStages.service;

import com.groupe.gestionDesStages.dto.EnseignantDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IEnseignantService {
    EnseignantDto createEnseignant(EnseignantDto enseignantDto);

    EnseignantDto findById(Long id);

    List<EnseignantDto> findAll();

    EnseignantDto findByEmail(String email);


    EnseignantDto updateEnseignantWithFiles(Long id, EnseignantDto enseignantDto, MultipartFile photoFile);

    void deleteById(Long id);
}
