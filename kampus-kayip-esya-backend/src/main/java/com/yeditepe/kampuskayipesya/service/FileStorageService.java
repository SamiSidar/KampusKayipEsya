package com.yeditepe.kampuskayipesya.service;

import com.yeditepe.kampuskayipesya.entity.FileRecord;
import com.yeditepe.kampuskayipesya.entity.User;
import com.yeditepe.kampuskayipesya.enums.UploadedFileType;
import com.yeditepe.kampuskayipesya.exception.BadRequestException;
import com.yeditepe.kampuskayipesya.repository.FileRecordRepository;
import com.yeditepe.kampuskayipesya.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;
    private final FileRecordRepository fileRecordRepository;
    private final UserRepository userRepository;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    public FileStorageService(
            @Value("${file.upload-dir}") String uploadDirStr,
            FileRecordRepository fileRecordRepository,
            UserRepository userRepository) {
        this.uploadDir = Paths.get(uploadDirStr).toAbsolutePath().normalize();
        this.fileRecordRepository = fileRecordRepository;
        this.userRepository = userRepository;

        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Upload dizini oluşturulamadı: " + this.uploadDir, e);
        }
    }

    /**
     * Dosyayı diske kaydeder, FileRecord oluşturur ve URL döner.
     */
    public String storeFile(MultipartFile file, Long userId) {
        if (file.isEmpty()) {
            throw new BadRequestException("Dosya boş olamaz.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("Sadece JPEG, PNG, WebP ve GIF dosyaları yüklenebilir.");
        }

        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String storedFileName = UUID.randomUUID().toString() + extension;

        try {
            Path targetPath = this.uploadDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Dosya kaydedilemedi.", e);
        }

        // FileRecord oluştur
        FileRecord record = new FileRecord();
        record.setOriginalFileName(originalFileName != null ? originalFileName : "unknown");
        record.setStoredFileName(storedFileName);
        record.setFilePath(this.uploadDir.resolve(storedFileName).toString());
        record.setFileType(UploadedFileType.IMAGE);
        record.setFileSize(file.getSize());
        record.setContentType(contentType);

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            record.setUploadedBy(user);
        }

        fileRecordRepository.save(record);

        // Frontend'in erişeceği URL'i döndür
        return "/api/uploads/" + storedFileName;
    }

    /**
     * Dosyayı diskten okuyup byte[] döner (serve etmek için).
     */
    public Path getFilePath(String fileName) {
        Path filePath = this.uploadDir.resolve(fileName).normalize();
        if (!Files.exists(filePath)) {
            throw new BadRequestException("Dosya bulunamadı: " + fileName);
        }
        return filePath;
    }
}
