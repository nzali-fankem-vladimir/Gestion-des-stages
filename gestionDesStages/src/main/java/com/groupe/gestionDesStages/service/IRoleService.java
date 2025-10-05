package com.groupe.gestionDesStages.service;


import com.groupe.gestionDesStages.models.Role;
import com.groupe.gestionDesStages.models.enums.ERole;

import java.util.List;
import java.util.Optional;

public interface IRoleService {
    Optional<Role> findByName(ERole name);
    List<Role> getAllRoles();
}
