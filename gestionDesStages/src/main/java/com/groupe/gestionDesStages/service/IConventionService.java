package com.groupe.gestionDesStages.service;

import com.groupe.gestionDesStages.dto.ConventionDto;

import java.util.List;

public interface IConventionService {
    ConventionDto createConvention(ConventionDto conventionDto);
    ConventionDto findById(Long id);
    List<ConventionDto> findAll();
    ConventionDto updateConvention(Long id, ConventionDto conventionDto);
    void deleteById(Long id);
}
