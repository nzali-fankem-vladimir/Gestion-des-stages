package com.groupe.gestionDesStages.repository;


import com.groupe.gestionDesStages.models.enums.ERole;
import com.groupe.gestionDesStages.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);


    boolean existsByName(ERole name);
}
