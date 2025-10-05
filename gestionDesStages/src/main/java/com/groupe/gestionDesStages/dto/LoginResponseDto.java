package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.enums.ERole;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponseDto {
    private String token;
    private Long id;
    private String email;
    private ERole role;
    private String fullName;
    private String avatarUrl;
}
