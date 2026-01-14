package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.*;
import com.mitmeerut.CFM_Portal.Repository.CommentRepository;
import com.mitmeerut.CFM_Portal.Repository.CourseFileRepository;
import com.mitmeerut.CFM_Portal.Repository.DocumentRepository;
import com.mitmeerut.CFM_Portal.Repository.HeadingRepository;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final CourseFileRepository courseFileRepository;
    private final HeadingRepository headingRepository;
    private final DocumentRepository documentRepository;

    public CommentController(CommentRepository commentRepository,
            CourseFileRepository courseFileRepository,
            HeadingRepository headingRepository,
            DocumentRepository documentRepository) {
        this.commentRepository = commentRepository;
        this.courseFileRepository = courseFileRepository;
        this.headingRepository = headingRepository;
        this.documentRepository = documentRepository;
    }

    // ==================== GET COMMENTS ====================

    /**
     * Get all comments for the current user's department
     * Returns comments where user is author OR comments on their course files
     */
    @GetMapping("/my-comments")
    public ResponseEntity<List<Map<String, Object>>> getMyComments(
            @AuthenticationPrincipal CustomUserDetails user) {

        Teacher teacher = user.getTeacher();
        if (teacher == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Get comments authored by this user
        List<Comment> authoredComments = commentRepository.findByAuthor_Id(teacher.getId());

        // Get comments on user's course files
        List<CourseFile> myCourseFiles = courseFileRepository.findByCreatedById(teacher.getId());
        Set<Long> myCourseFileIds = myCourseFiles.stream()
                .map(CourseFile::getId)
                .collect(Collectors.toSet());

        // Get all root comments (no parent) for user's course files
        List<Comment> allComments = commentRepository.findAll();
        Set<Comment> relevantComments = new HashSet<>(authoredComments);

        for (Comment c : allComments) {
            if (c.getParentComment() == null) { // Root comments only
                if (c.getCourseFile() != null && myCourseFileIds.contains(c.getCourseFile().getId())) {
                    relevantComments.add(c);
                }
            }
        }

        // Convert to DTOs with replies
        List<Map<String, Object>> result = relevantComments.stream()
                .filter(c -> c.getParentComment() == null) // Only root comments
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::commentToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get comments for a specific course file
     */
    @GetMapping("/course-file/{courseFileId}")
    public ResponseEntity<List<Map<String, Object>>> getCommentsForCourseFile(
            @PathVariable Long courseFileId,
            @AuthenticationPrincipal CustomUserDetails user) {

        List<Comment> comments = commentRepository.findByCourseFile_Id(courseFileId);

        // Filter to root comments only, include replies in DTO
        List<Map<String, Object>> result = comments.stream()
                .filter(c -> c.getParentComment() == null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::commentToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get all comments for department (Subject Head / HOD)
     */
    @GetMapping("/department")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentComments(
            @AuthenticationPrincipal CustomUserDetails user) {

        Teacher teacher = user.getTeacher();
        if (teacher == null || teacher.getDepartment() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        Long departmentId = teacher.getDepartment().getId();

        // Get all comments for course files in this department
        List<CourseFile> deptCourseFiles = courseFileRepository.findByDepartmentId(departmentId);
        Set<Long> deptCourseFileIds = deptCourseFiles.stream()
                .map(CourseFile::getId)
                .collect(Collectors.toSet());

        List<Comment> allComments = commentRepository.findAll();

        List<Map<String, Object>> result = allComments.stream()
                .filter(c -> c.getParentComment() == null) // Root comments
                .filter(c -> c.getCourseFile() != null && deptCourseFileIds.contains(c.getCourseFile().getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::commentToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ==================== CREATE COMMENT ====================

    /**
     * Create a new comment
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createComment(
            @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {

        Teacher teacher = user.getTeacher();
        if (teacher == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        Comment comment = new Comment();
        comment.setAuthor(teacher);
        comment.setText(request.text);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setIsReceived(false);

        // Set course file
        if (request.courseFileId != null) {
            CourseFile cf = courseFileRepository.findById(request.courseFileId)
                    .orElseThrow(() -> new RuntimeException("Course file not found"));
            comment.setCourseFile(cf);
        }

        // Set heading (optional)
        if (request.headingId != null) {
            Heading heading = headingRepository.findById(request.headingId)
                    .orElseThrow(() -> new RuntimeException("Heading not found"));
            comment.setHeading(heading);
        }

        // Set document (optional)
        if (request.documentId != null) {
            Document doc = documentRepository.findById(request.documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            comment.setDocument(doc);
        }

        Comment saved = commentRepository.save(comment);
        return ResponseEntity.ok(commentToDto(saved));
    }

    /**
     * Reply to an existing comment
     */
    @PostMapping("/{commentId}/reply")
    public ResponseEntity<Map<String, Object>> replyToComment(
            @PathVariable Long commentId,
            @RequestBody ReplyRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {

        Teacher teacher = user.getTeacher();
        if (teacher == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        Comment parentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Comment reply = new Comment();
        reply.setAuthor(teacher);
        reply.setText(request.text);
        reply.setParentComment(parentComment);
        reply.setCourseFile(parentComment.getCourseFile());
        reply.setHeading(parentComment.getHeading());
        reply.setDocument(parentComment.getDocument());
        reply.setCreatedAt(LocalDateTime.now());
        reply.setIsReceived(false);

        Comment saved = commentRepository.save(reply);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("text", saved.getText());
        result.put("author", Map.of(
                "id", saved.getAuthor().getId(),
                "name", saved.getAuthor().getName(),
                "designation", saved.getAuthor().getDesignation() != null ? saved.getAuthor().getDesignation() : ""));
        result.put("createdAt", saved.getCreatedAt());

        return ResponseEntity.ok(result);
    }

    // ==================== UPDATE / DELETE ====================

    /**
     * Update own comment
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateComment(
            @PathVariable Long id,
            @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check ownership
        if (!comment.getAuthor().getId().equals(user.getTeacher().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to edit this comment"));
        }

        comment.setText(request.text);
        Comment saved = commentRepository.save(comment);

        return ResponseEntity.ok(commentToDto(saved));
    }

    /**
     * Delete own comment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user) {

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check ownership
        if (!comment.getAuthor().getId().equals(user.getTeacher().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to delete this comment"));
        }

        commentRepository.delete(comment);
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }

    // ==================== HELPER METHODS ====================

    private Map<String, Object> commentToDto(Comment comment) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", comment.getId());
        dto.put("text", comment.getText());
        dto.put("createdAt", comment.getCreatedAt());
        dto.put("isReceived", comment.getIsReceived());

        // Author info
        if (comment.getAuthor() != null) {
            Map<String, Object> author = new HashMap<>();
            author.put("id", comment.getAuthor().getId());
            author.put("name", comment.getAuthor().getName());
            author.put("designation",
                    comment.getAuthor().getDesignation() != null ? comment.getAuthor().getDesignation() : "");
            author.put("avatar", getInitials(comment.getAuthor().getName()));
            dto.put("author", author);
        }

        // Course file info
        if (comment.getCourseFile() != null) {
            Map<String, Object> cf = new HashMap<>();
            cf.put("id", comment.getCourseFile().getId());
            cf.put("courseCode", comment.getCourseFile().getCourse().getCode());
            cf.put("courseTitle", comment.getCourseFile().getCourse().getTitle());
            dto.put("courseFile", cf);
        }

        // Document info
        if (comment.getDocument() != null) {
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", comment.getDocument().getId());
            doc.put("fileName", comment.getDocument().getFileName());
            dto.put("document", doc);
        }

        // Heading info
        if (comment.getHeading() != null) {
            Map<String, Object> heading = new HashMap<>();
            heading.put("id", comment.getHeading().getId());
            heading.put("title", comment.getHeading().getTitle());
            dto.put("heading", heading);
        }

        // Get replies
        List<Comment> allComments = commentRepository.findAll();
        List<Map<String, Object>> replies = allComments.stream()
                .filter(c -> c.getParentComment() != null && c.getParentComment().getId().equals(comment.getId()))
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .map(this::replyToDto)
                .collect(Collectors.toList());
        dto.put("replies", replies);

        return dto;
    }

    private Map<String, Object> replyToDto(Comment reply) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", reply.getId());
        dto.put("text", reply.getText());
        dto.put("createdAt", reply.getCreatedAt());

        if (reply.getAuthor() != null) {
            dto.put("author", reply.getAuthor().getName());
            dto.put("avatar", getInitials(reply.getAuthor().getName()));
            dto.put("authorDesignation",
                    reply.getAuthor().getDesignation() != null ? reply.getAuthor().getDesignation() : "");
        }

        return dto;
    }

    private String getInitials(String name) {
        if (name == null || name.isEmpty())
            return "??";
        String[] parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0].charAt(0) + "" + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
        return name.substring(0, Math.min(2, name.length())).toUpperCase();
    }

    // ==================== REQUEST DTOs ====================

    public static class CreateCommentRequest {
        public Long courseFileId;
        public Long headingId;
        public Long documentId;
        public String text;
    }

    public static class ReplyRequest {
        public String text;
    }

    public static class UpdateCommentRequest {
        public String text;
    }
}
