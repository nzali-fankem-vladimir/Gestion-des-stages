package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.models.Role;
import com.groupe.gestionDesStages.models.enums.ERole;
import com.groupe.gestionDesStages.repository.RoleRepository;
import com.groupe.gestionDesStages.service.IRoleService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleServiceImpl implements IRoleService {

    private final RoleRepository roleRepository;


    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public Optional<Role> findByName(ERole name) {
        return roleRepository.findByName(name);
    }

    @Override
    public List<Role> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        if (roles.isEmpty()) {
            throw new EntityNotFoundException("Aucun rôle trouvé dans la base de donnees!");
        }
        return roles;
    }
}
