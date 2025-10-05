package com.groupe.gestionDesStages.repository;

import com.groupe.gestionDesStages.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Override
    Optional<Message> findById(Long id);


    List<Message> findByCandidatureId(Long candidatureId);


    List<Message> findBySenderIdOrReceiverId(Long senderId, Long receiverId);
}
