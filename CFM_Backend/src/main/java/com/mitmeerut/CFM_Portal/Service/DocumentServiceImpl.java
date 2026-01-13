package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Document;
import com.mitmeerut.CFM_Portal.Model.Heading;
import com.mitmeerut.CFM_Portal.Model.Teacher;
import com.mitmeerut.CFM_Portal.Repository.DocumentRepository;
import com.mitmeerut.CFM_Portal.Repository.HeadingRepository;
import com.mitmeerut.CFM_Portal.Repository.TeacherRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepo;
    private final HeadingRepository headingRepo;
    private final TeacherRepository teacherRepo;

    @Value("${file.upload.base-path:storage}")
    private String baseUploadPath;

    @Autowired
    public DocumentServiceImpl(DocumentRepository documentRepo, HeadingRepository headingRepo,
            TeacherRepository teacherRepo) {
        this.documentRepo = documentRepo;
        this.headingRepo = headingRepo;
        this.teacherRepo = teacherRepo;
    }

    @Override
    public Document uploadDocument(Long headingId, MultipartFile file, Long teacherId, String courseCode) {
        Heading heading = headingRepo.findById(headingId)
                .orElseThrow(() -> new RuntimeException("Heading not found"));

        Teacher teacher = teacherRepo.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Build storage path: storage/teachers/{teacherId}/{courseCode}/{headingTitle}/
        String sanitizedHeadingTitle = sanitizeFileName(heading.getTitle());
        String storagePath = String.format("%s/teachers/%d/%s/%s/",
                baseUploadPath, teacherId, courseCode, sanitizedHeadingTitle);

        // Create directories if they don't exist
        Path dirPath = Paths.get(storagePath);
        try {
            Files.createDirectories(dirPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create storage directory: " + e.getMessage());
        }

        // Generate unique filename to avoid conflicts
        String originalFileName = file.getOriginalFilename();
        String uniqueFileName = System.currentTimeMillis() + "_" + sanitizeFileName(originalFileName);
        Path filePath = dirPath.resolve(uniqueFileName);

        // Save file to filesystem
        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }

        // Check for existing versions
        List<Document> existingDocs = documentRepo.findByHeading_Id(headingId);
        int versionNo = existingDocs.stream()
                .filter(d -> d.getFileName().equals(originalFileName))
                .mapToInt(d -> d.getVersionNo() != null ? d.getVersionNo() : 0)
                .max()
                .orElse(0) + 1;

        // Create Document record
        Document document = new Document();
        document.setHeading(heading);
        document.setUploadedBy(teacher);
        document.setFileName(originalFileName);
        document.setFilePath(filePath.toString());
        document.setType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setVersionNo(versionNo);
        document.setUploadedAt(LocalDateTime.now());

        return documentRepo.save(document);
    }

    @Override
    public void deleteDocument(Long id) {
        Document document = documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Delete file from filesystem
        try {
            Path filePath = Paths.get(document.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Warning: Could not delete file from filesystem: " + e.getMessage());
        }

        // Delete database record
        documentRepo.delete(document);
    }

    @Override
    public List<Document> getDocumentsByHeading(Long headingId) {
        return documentRepo.findByHeading_Id(headingId);
    }

    @Override
    public Document getDocumentById(Long id) {
        return documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null)
            return "unnamed";
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
