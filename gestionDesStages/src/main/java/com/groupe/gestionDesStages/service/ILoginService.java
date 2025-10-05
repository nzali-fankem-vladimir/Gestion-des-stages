package com.groupe.gestionDesStages.service;

import com.groupe.gestionDesStages.dto.LoginResponseDto;
import com.groupe.gestionDesStages.dto.serviceDto.LoginRequestDto;
import com.groupe.gestionDesStages.dto.serviceDto.RegisterRequestDto;


public interface ILoginService {
    LoginResponseDto register(RegisterRequestDto request);
    LoginResponseDto login(LoginRequestDto request);
    LoginResponseDto getCurrentUser(String email);
}
