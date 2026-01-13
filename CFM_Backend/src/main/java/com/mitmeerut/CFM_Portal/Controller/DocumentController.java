package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.Document;
import com.mitmeerut.CFM_Portal.Service.DocumentService;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/teacher/documents")
public class DocumentController {

    private final DocumentService documentService;

    @Autowired
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("headingId") Long headingId,
            @RequestParam("courseCode") String courseCode,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails user) {
        Long teacherId = user.getTeacher().getId();
        Document document = documentService.uploadDocument(headingId, file, teacherId, courseCode);

        Map<String, Object> response = new HashMap<>();
        response.put("id", document.getId());
        response.put("fileName", document.getFileName());
        response.put("fileSize", document.getFileSize());
        response.put("versionNo", document.getVersionNo());
        response.put("uploadedAt", document.getUploadedAt());
        response.put("type", document.getType());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
    }

    @GetMapping("/heading/{headingId}")
    public ResponseEntity<List<Map<String, Object>>> getDocumentsByHeading(
            @PathVariable Long headingId,
            @AuthenticationPrincipal CustomUserDetails user) {
        List<Document> documents = documentService.getDocumentsByHeading(headingId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Document doc : documents) {
            Map<String, Object> docMap = new HashMap<>();
            docMap.put("id", doc.getId());
            docMap.put("fileName", doc.getFileName());
            docMap.put("fileSize", doc.getFileSize());
            docMap.put("versionNo", doc.getVersionNo());
            docMap.put("uploadedAt", doc.getUploadedAt());
            docMap.put("type", doc.getType());
            result.add(docMap);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user) throws IOException {
        Document document = documentService.getDocumentById(id);
        Path filePath = Paths.get(document.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .body(resource);
    }
}
