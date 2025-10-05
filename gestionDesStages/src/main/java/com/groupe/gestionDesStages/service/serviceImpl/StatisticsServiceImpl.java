package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.models.enums.ERole;
import com.groupe.gestionDesStages.repository.*;
import com.groupe.gestionDesStages.service.IStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements IStatisticsService {

    private final UtilisateurRepository utilisateurRepository;
    private final CandidatureRepository candidatureRepository;
    private final OffreRepository offreRepository;
    private final ConventionRepository conventionRepository;

    @Override
    public Map<String, Object> getGlobalStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("users", getUserStatistics());
        stats.put("candidatures", getCandidatureStatistics());
        stats.put("offres", getOffreStatistics());
        stats.put("conventions", getConventionStatistics());
        
        return stats;
    }

    @Override
    public Map<String, Long> getUserStatistics() {
        Map<String, Long> stats = new HashMap<>();
        
        stats.put("ETUDIANT", (long) utilisateurRepository.findByRole_Name(ERole.ETUDIANT).size());
        stats.put("ENSEIGNANT", (long) utilisateurRepository.findByRole_Name(ERole.ENSEIGNANT).size());
        stats.put("ENTREPRISE", (long) utilisateurRepository.findByRole_Name(ERole.ENTREPRISE).size());
        stats.put("ADMIN", (long) utilisateurRepository.findByRole_Name(ERole.ADMIN).size());
        stats.put("TOTAL", utilisateurRepository.count());
        
        return stats;
    }

    @Override
    public Map<String, Long> getCandidatureStatistics() {
        Map<String, Long> stats = new HashMap<>();
        
        stats.put("TOTAL", candidatureRepository.count());
        // Ajouter d'autres statistiques selon les besoins
        
        return stats;
    }

    @Override
    public Map<String, Long> getOffreStatistics() {
        Map<String, Long> stats = new HashMap<>();
        
        stats.put("TOTAL", offreRepository.count());
        // Ajouter d'autres statistiques selon les besoins
        
        return stats;
    }

    @Override
    public Map<String, Long> getConventionStatistics() {
        Map<String, Long> stats = new HashMap<>();
        
        stats.put("TOTAL", conventionRepository.count());
        // Ajouter d'autres statistiques selon les besoins
        
        return stats;
    }
}
