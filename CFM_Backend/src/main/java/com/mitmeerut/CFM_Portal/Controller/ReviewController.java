package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.*;
import com.mitmeerut.CFM_Portal.Repository.CourseFileRepository;
import com.mitmeerut.CFM_Portal.Service.HeadingService;
import com.mitmeerut.CFM_Portal.Service.DocumentService;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controller for review operations accessible by Subject Head and HOD
 */
@RestController
@RequestMapping("/api/review")
public class ReviewController {

    private final CourseFileRepository courseFileRepository;
    private final HeadingService headingService;
    private final DocumentService documentService;

    public ReviewController(CourseFileRepository courseFileRepository,
            HeadingService headingService,
            DocumentService documentService) {
        this.courseFileRepository = courseFileRepository;
        this.headingService = headingService;
        this.documentService = documentService;
    }

    /**
     * Get course file details for review
     */
    @GetMapping("/course-file/{id}")
    public ResponseEntity<Map<String, Object>> getCourseFileDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user) {

        CourseFile courseFile = courseFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course file not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", courseFile.getId());
        response.put("status", courseFile.getStatus());
        response.put("courseCode", courseFile.getCourse().getCode());
        response.put("courseTitle", courseFile.getCourse().getTitle());
        response.put("teacherName", courseFile.getCreatedBy().getName());
        response.put("academicYear", courseFile.getAcademicYear());
        response.put("section", courseFile.getSection());
        response.put("submittedDate", courseFile.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    /**
     * Get heading tree structure for a course file (for review purposes)
     */
    @GetMapping("/course-file/{courseFileId}/tree")
    public ResponseEntity<List<Map<String, Object>>> getTreeStructure(
            @PathVariable Long courseFileId,
            @AuthenticationPrincipal CustomUserDetails user) {

        List<Heading> rootHeadings = headingService.getHeadingsByCourseFile(courseFileId);
        List<Map<String, Object>> tree = new ArrayList<>();

        for (Heading heading : rootHeadings) {
            tree.add(buildTreeNode(heading));
        }

        return ResponseEntity.ok(tree);
    }

    private Map<String, Object> buildTreeNode(Heading heading) {
        Map<String, Object> node = new HashMap<>();
        node.put("id", heading.getId());
        node.put("title", heading.getTitle());
        node.put("orderIndex", heading.getOrderIndex());
        node.put("courseFileId", heading.getCourseFile() != null ? heading.getCourseFile().getId() : null);
        node.put("parentHeadingId", heading.getParentHeading() != null ? heading.getParentHeading().getId() : null);
        node.put("createdAt", heading.getCreatedAt());

        // Get children
        List<Heading> children = headingService.getChildHeadings(heading.getId());
        List<Map<String, Object>> childNodes = new ArrayList<>();
        for (Heading child : children) {
            childNodes.add(buildTreeNode(child));
        }
        node.put("children", childNodes);

        // Get documents
        List<Document> documents = documentService.getDocumentsByHeading(heading.getId());
        List<Map<String, Object>> docList = new ArrayList<>();
        for (Document doc : documents) {
            Map<String, Object> docMap = new HashMap<>();
            docMap.put("id", doc.getId());
            docMap.put("fileName", doc.getFileName());
            docMap.put("fileSize", doc.getFileSize());
            docMap.put("versionNo", doc.getVersionNo());
            docMap.put("uploadedAt", doc.getUploadedAt());
            docMap.put("type", doc.getType());
            docList.add(docMap);
        }
        node.put("documents", docList);

        return node;
    }
}
