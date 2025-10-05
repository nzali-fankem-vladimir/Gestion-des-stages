package com.groupe.gestionDesStages.dto;

import com.groupe.gestionDesStages.models.enums.ERole;
import com.groupe.gestionDesStages.models.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class RoleDto {

    private Long id;
    private ERole name;

    public static RoleDto fromEntity(Role role) {
        if (role == null) {
            return null;
        }
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .build();
    }
}
