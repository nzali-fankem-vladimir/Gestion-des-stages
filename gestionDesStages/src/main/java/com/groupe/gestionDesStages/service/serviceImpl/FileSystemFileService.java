package com.groupe.gestionDesStages.service.serviceImpl;

import com.groupe.gestionDesStages.service.IFileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class FileSystemFileService implements IFileService {

    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @Value("${file.images-dir}")
    private String imagesDir;
    
    @Value("${file.documents-dir}")
    private String documentsDir;
    
    @Value("${file.profiles-dir}")
    private String profilesDir;

    @Override
    public String storeFile(MultipartFile file) {
        return storeFileInCategory(file, "general");
    }
    
    /**
     * Stocke un fichier dans une catégorie spécifique
     */
    public String storeFileInCategory(MultipartFile file, String category) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }
        try {
            // Déterminer le dossier selon la catégorie
            String targetDir = getDirectoryForCategory(category);
            Path uploadPath = Paths.get(targetDir);
            
            // Créer le dossier s'il n'existe pas
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✅ Dossier créé: " + uploadPath);
            }
            
            String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String fileExtension = "";
            int dotIndex = originalFileName.lastIndexOf('.');
            if (dotIndex > 0) {
                fileExtension = originalFileName.substring(dotIndex);
            }
            
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath);
            
            System.out.println("✅ Fichier stocké: " + filePath);
            return uniqueFileName; // Retourne le nom de fichier unique
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }
    
    /**
     * Retourne le dossier approprié selon la catégorie
     */
    private String getDirectoryForCategory(String category) {
        return switch (category.toLowerCase()) {
            case "profile", "avatar", "photo" -> profilesDir;
            case "document", "cv", "pdf" -> documentsDir;
            case "image", "logo" -> imagesDir;
            default -> uploadDir;
        };
    }

    @Override
    public Resource loadAsResource(String fileName) {
        try {
            // Chercher le fichier dans tous les dossiers possibles
            String[] directories = {profilesDir, imagesDir, documentsDir, uploadDir};
            
            for (String directory : directories) {
                Path filePath = Paths.get(directory).resolve(fileName).normalize();
                Resource resource = new UrlResource(filePath.toUri());
                if (resource.exists() && resource.isReadable()) {
                    System.out.println("✅ Fichier trouvé dans: " + directory);
                    return resource;
                }
            }
            
            throw new RuntimeException("Could not read file: " + fileName);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + fileName, e);
        }
    }

    @Override
    public void deleteAll() {
        // il faudra implémenter la logique de suppression si nécessaire
    }

    @Override
    public Stream<Path> loadAll() {
        //to do
        return null;

    }
}
