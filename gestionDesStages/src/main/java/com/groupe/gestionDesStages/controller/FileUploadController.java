package com.groupe.gestionDesStages.controller;

import com.groupe.gestionDesStages.service.IFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Upload de fichiers", description = "Opérations d'upload pour les images de profil et les logos d'entreprise.")
public class FileUploadController {

    private final IFileService fileService;

    
    public FileUploadController(IFileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Télécharger un fichier",
            description = "Permet de télécharger une image de profil ou un logo. Le fichier sera sauvegardé avec un nom unique.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Fichier téléchargé avec succès. Retourne le nom de fichier unique.",
                            content = @Content(schema = @Schema(implementation = String.class))),
                    @ApiResponse(responseCode = "400", description = "Requête invalide. Aucun fichier n'a été sélectionné."),
                    @ApiResponse(responseCode = "500", description = "Erreur serveur. Échec du téléchargement du fichier.")
            }
    )
    public ResponseEntity<String> uploadFile(
            @Parameter(description = "Le fichier à télécharger", required = true)
            @RequestParam("file") MultipartFile file) {
        try {
            // Utilise le service pour stocker le fichier, qui gère la logique de chemin et de nom unique
            String uniqueFileName = fileService.storeFile(file);
            return new ResponseEntity<>(uniqueFileName, HttpStatus.OK);
        } catch (RuntimeException ex) {
            // Gère les exceptions levées par le service (ex: fichier vide)
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/files/{filename:.+}")
    @Operation(
            summary = "Récupérer un fichier",
            description = "Permet de récupérer un fichier uploadé par son nom.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Fichier récupéré avec succès"),
                    @ApiResponse(responseCode = "404", description = "Fichier non trouvé")
            }
    )
    public ResponseEntity<Resource> getFile(
            @Parameter(description = "Le nom du fichier à récupérer", required = true)
            @PathVariable String filename) {
        System.out.println("=== DEMANDE FICHIER ===");
        System.out.println("Filename demandé: " + filename);
        
        try {
            Resource file = fileService.loadAsResource(filename);
            
            // Déterminer le type de contenu
            String contentType = null;
            try {
                Path filePath = Paths.get(file.getFile().getAbsolutePath());
                contentType = Files.probeContentType(filePath);
            } catch (IOException ex) {
                // Fallback pour les images
                if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else {
                    contentType = "application/octet-stream";
                }
            }

            System.out.println("✅ Fichier trouvé: " + file.getFilename());
            System.out.println("Content-Type: " + contentType);
            
            // Ajouter un header CORS explicite et s'assurer du bon content-type pour les images JPEG
            ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"");

            if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                builder = builder.contentType(MediaType.IMAGE_JPEG);
            } else {
                builder = builder.contentType(MediaType.parseMediaType(contentType));
            }

            return builder.body(file);
                    
        } catch (RuntimeException ex) {
            System.err.println("❌ Fichier non trouvé: " + filename);
            System.err.println("Erreur: " + ex.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
