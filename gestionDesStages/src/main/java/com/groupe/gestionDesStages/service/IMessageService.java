package com.groupe.gestionDesStages.service;

import com.groupe.gestionDesStages.dto.MessageDto;

import java.util.List;

public interface IMessageService {
    MessageDto createMessage(MessageDto messageDto);
    MessageDto findById(Long id);
    List<MessageDto> findByCandidatureId(Long candidatureId);
    List<MessageDto> findBySenderIdOrReceiverId(Long userId);
    void deleteById(Long id);
}
