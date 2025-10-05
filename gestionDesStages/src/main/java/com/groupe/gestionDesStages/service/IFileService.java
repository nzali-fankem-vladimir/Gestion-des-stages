package com.groupe.gestionDesStages.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface IFileService {
    String storeFile(MultipartFile file);
    String storeFileInCategory(MultipartFile file, String category);
    Resource loadAsResource(String fileName);
    void deleteAll();
    Stream<Path> loadAll();
}
