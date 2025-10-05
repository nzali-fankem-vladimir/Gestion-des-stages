package com.groupe.gestionDesStages.service;

import java.util.Map;

public interface IStatisticsService {
    
    Map<String, Object> getGlobalStatistics();
    
    Map<String, Long> getUserStatistics();
    
    Map<String, Long> getCandidatureStatistics();
    
    Map<String, Long> getOffreStatistics();
    
    Map<String, Long> getConventionStatistics();
}
