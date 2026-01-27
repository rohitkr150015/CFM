package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.*;
import com.mitmeerut.CFM_Portal.Repository.CommentRepository;
import com.mitmeerut.CFM_Portal.Repository.CourseFileRepository;
import com.mitmeerut.CFM_Portal.Repository.DocumentRepository;
import com.mitmeerut.CFM_Portal.Repository.HeadingRepository;
import com.mitmeerut.CFM_Portal.Repository.NotificationRepository;
import com.mitmeerut.CFM_Portal.Repository.UserRepository;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CommentController(CommentRepository commentRepository,
            CourseFileRepository courseFileRepository,
            HeadingRepository headingRepository,
            DocumentRepository documentRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.courseFileRepository = courseFileRepository;
        this.headingRepository = headingRepository;
        this.documentRepository = documentRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
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

        // Create notification for course file owner if comment is on their file
        if (request.courseFileId != null) {
            CourseFile courseFile = courseFileRepository.findById(request.courseFileId).orElse(null);
            if (courseFile != null && courseFile.getCreatedBy() != null) {
                // Don't notify if commenting on own file
                if (!courseFile.getCreatedBy().getId().equals(teacher.getId())) {
                    createNotificationForComment(courseFile.getCreatedBy(), teacher, courseFile, saved);
                }

                // If Subject Head is commenting on a document, auto-update status to RETURNED
                if (request.documentId != null && isSubjectHead(teacher)) {
                    courseFile.setStatus("RETURNED_BY_SUBJECT_HEAD");
                    courseFileRepository.save(courseFile);
                }
            }
        }

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

        // Create notification for parent comment author
        if (parentComment.getAuthor() != null && !parentComment.getAuthor().getId().equals(teacher.getId())) {
            createNotificationForReply(parentComment.getAuthor(), teacher, parentComment);
        }

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

    // Helper method to check if teacher is a Subject Head for any course
    private boolean isSubjectHead(Teacher teacher) {
        // Check if this teacher has any CourseTeacher records with isSubjectHead = true
        // This is a simplified check - you may want to make it more specific
        return teacher.getDesignation() != null &&
                teacher.getDesignation().toLowerCase().contains("subject head");
    }

    // Create notification when someone comments on a course file
    private void createNotificationForComment(Teacher recipient, Teacher commenter, CourseFile courseFile,
            Comment comment) {
        try {
            Optional<User> userOpt = userRepository.findByTeacher_Id(recipient.getId());
            if (userOpt.isPresent()) {
                Notification notification = new Notification();
                notification.setUser(userOpt.get());
                notification.setType("COMMENT_ADDED");

                Map<String, Object> payload = new HashMap<>();
                payload.put("message", commenter.getName() + " commented on your course file");
                payload.put("courseFileId", courseFile.getId());
                payload.put("courseCode", courseFile.getCourse().getCode());
                payload.put("courseTitle", courseFile.getCourse().getTitle());
                payload.put("commenterName", commenter.getName());
                payload.put("commentText", comment.getText());

                notification.setPayload(objectMapper.writeValueAsString(payload));
                notification.setIsRead(false);
                notification.setCreatedAt(LocalDateTime.now());

                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            // Log error but don't fail the comment creation
            System.err.println("Error creating notification: " + e.getMessage());
        }
    }

    // Create notification when someone replies to a comment
    private void createNotificationForReply(Teacher recipient, Teacher replier, Comment parentComment) {
        try {
            Optional<User> userOpt = userRepository.findByTeacher_Id(recipient.getId());
            if (userOpt.isPresent()) {
                Notification notification = new Notification();
                notification.setUser(userOpt.get());
                notification.setType("COMMENT_REPLY");

                Map<String, Object> payload = new HashMap<>();
                payload.put("message", replier.getName() + " replied to your comment");
                if (parentComment.getCourseFile() != null) {
                    payload.put("courseFileId", parentComment.getCourseFile().getId());
                    payload.put("courseCode", parentComment.getCourseFile().getCourse().getCode());
                }
                payload.put("replierName", replier.getName());
                payload.put("originalComment", parentComment.getText());

                notification.setPayload(objectMapper.writeValueAsString(payload));
                notification.setIsRead(false);
                notification.setCreatedAt(LocalDateTime.now());

                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            // Log error but don't fail the reply creation
            System.err.println("Error creating notification: " + e.getMessage());
        }
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
