package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.Heading;
import com.mitmeerut.CFM_Portal.Model.Document;
import com.mitmeerut.CFM_Portal.Service.HeadingService;
import com.mitmeerut.CFM_Portal.Service.DocumentService;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/teacher/headings")
public class HeadingController {

    private final HeadingService headingService;
    private final DocumentService documentService;

    @Autowired
    public HeadingController(HeadingService headingService, DocumentService documentService) {
        this.headingService = headingService;
        this.documentService = documentService;
    }

    // DTO for creating heading
    public static class CreateHeadingRequest {
        public Long courseFileId;
        public Long parentHeadingId;
        public String title;
        public Integer orderIndex;
    }

    // DTO for updating heading
    public static class UpdateHeadingRequest {
        public String title;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createHeading(
            @RequestBody CreateHeadingRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Heading heading = headingService.createHeading(
                request.courseFileId,
                request.parentHeadingId,
                request.title,
                request.orderIndex);
        return ResponseEntity.ok(headingToMap(heading));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateHeading(
            @PathVariable Long id,
            @RequestBody UpdateHeadingRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Heading heading = headingService.updateHeading(id, request.title);
        return ResponseEntity.ok(headingToMap(heading));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteHeading(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user) {
        headingService.deleteHeading(id);
        return ResponseEntity.ok(Map.of("message", "Heading deleted successfully"));
    }

    // Get full tree structure for a course file
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
        Map<String, Object> node = headingToMap(heading);

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
        node.put("files", docList);

        return node;
    }

    private Map<String, Object> headingToMap(Heading heading) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", heading.getId());
        map.put("title", heading.getTitle());
        map.put("orderIndex", heading.getOrderIndex());
        map.put("courseFileId", heading.getCourseFile() != null ? heading.getCourseFile().getId() : null);
        map.put("parentHeadingId", heading.getParentHeading() != null ? heading.getParentHeading().getId() : null);
        map.put("createdAt", heading.getCreatedAt());
        return map;
    }
}