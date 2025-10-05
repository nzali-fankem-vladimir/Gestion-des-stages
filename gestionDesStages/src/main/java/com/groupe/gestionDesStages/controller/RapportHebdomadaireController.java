package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.dto.RapportHebdomadaireDto;
import com.groupe.gestionDesStages.service.IRapportHebdomadaireService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rapports-hebdomadaires")
@RequiredArgsConstructor
public class RapportHebdomadaireController {

    private final IRapportHebdomadaireService rapportService;

    // ========================= CREATE =========================
    @PostMapping
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<RapportHebdomadaireDto> createRapport(
            @RequestPart("rapport") @Valid RapportHebdomadaireDto rapportDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            RapportHebdomadaireDto createdRapport = rapportService.createRapport(rapportDto, file);
            return new ResponseEntity<>(createdRapport, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    // ========================= CREATE SIMPLE (JSON) =========================
    @PostMapping("/simple")
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<RapportHebdomadaireDto> createRapportSimple(
            @RequestBody @Valid RapportHebdomadaireDto rapportDto) {
        try {
            RapportHebdomadaireDto createdRapport = rapportService.createRapport(rapportDto, null);
            return new ResponseEntity<>(createdRapport, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    // ========================= FINDERS =========================
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ETUDIANT')")
    public ResponseEntity<RapportHebdomadaireDto> findById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(rapportService.findById(id));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<RapportHebdomadaireDto>> findAll() {
        return ResponseEntity.ok(rapportService.findAll());
    }

    @GetMapping("/etudiant/{etudiantId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ETUDIANT')")
    public ResponseEntity<List<RapportHebdomadaireDto>> findByEtudiantId(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(rapportService.findByEtudiantId(etudiantId));
    }

    @GetMapping("/stage/{offreId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ENTREPRISE')")
    public ResponseEntity<List<RapportHebdomadaireDto>> findByOffreId(@PathVariable Long offreId) {
        return ResponseEntity.ok(rapportService.findByOffreId(offreId));
    }

    // ========================= UPDATE =========================
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<RapportHebdomadaireDto> updateRapport(
            @PathVariable Long id,
            @RequestPart("rapport") @Valid RapportHebdomadaireDto rapportDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            return ResponseEntity.ok(rapportService.updateRapport(id, rapportDto, file));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    // ========================= SUBMIT =========================
    @PutMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<RapportHebdomadaireDto> submitRapport(
            @PathVariable Long id,
            @RequestBody Map<String, Object> submissionData) {
        try {
            String statut = (String) submissionData.get("statut");
            Long enseignantId = Long.parseLong(submissionData.get("enseignantId").toString());
            return ResponseEntity.ok(rapportService.submitRapport(id, statut, enseignantId));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    // ========================= DELETE =========================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ETUDIANT')")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        try {
            rapportService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    // ========================= ENSEIGNANT =========================
    @GetMapping("/enseignant/{enseignantId}")
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    public ResponseEntity<List<RapportHebdomadaireDto>> getRapportsByEnseignant(@PathVariable Long enseignantId) {
        return ResponseEntity.ok(rapportService.findRapportsByEnseignant(enseignantId));
    }

    @PutMapping("/{id}/validate")
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    public ResponseEntity<RapportHebdomadaireDto> validateRapport(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String commentaires = request.get("commentaires");
        return ResponseEntity.ok(rapportService.validateRapport(id, commentaires));
    }

    @PutMapping("/{id}/request-modification")
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    public ResponseEntity<RapportHebdomadaireDto> requestModification(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String commentaires = request.get("commentaires");
        return ResponseEntity.ok(rapportService.requestModification(id, commentaires));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    public ResponseEntity<RapportHebdomadaireDto> rejectRapport(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        return ResponseEntity.ok(rapportService.rejectRapport(id, reason));
    }
}
