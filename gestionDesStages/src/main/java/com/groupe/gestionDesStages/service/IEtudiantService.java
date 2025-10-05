package com.groupe.gestionDesStages.service;

import com.groupe.gestionDesStages.dto.EtudiantDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IEtudiantService {

    EtudiantDto createEtudiant(EtudiantDto etudiantDto);

    EtudiantDto findById(Long id);

    List<EtudiantDto> findAll();

    EtudiantDto findByEmail(String email);

    EtudiantDto findByMatricule(String matricule);

    List<EtudiantDto> findByNomAndFiliere(String nom, String filiere);

    EtudiantDto updateEtudiantWithFiles(Long id, EtudiantDto etudiantDto, MultipartFile photoFile, MultipartFile cvFile) throws IOException;


    void deleteById(Long id);

}
