package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.*;
import com.mitmeerut.CFM_Portal.Repository.ApprovalRepository;
import com.mitmeerut.CFM_Portal.Repository.CourseFileRepository;
import com.mitmeerut.CFM_Portal.Repository.CommentRepository;
import com.mitmeerut.CFM_Portal.Repository.UserRepository;
import com.mitmeerut.CFM_Portal.Service.NotificationHelperService;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApprovalController {

    private final CourseFileRepository courseFileRepository;
    private final ApprovalRepository approvalRepository;
    private final CommentRepository commentRepository;
    private final NotificationHelperService notificationHelper;
    private final UserRepository userRepository;

    public ApprovalController(CourseFileRepository courseFileRepository,
            ApprovalRepository approvalRepository,
            CommentRepository commentRepository,
            NotificationHelperService notificationHelper,
            UserRepository userRepository) {
        this.courseFileRepository = courseFileRepository;
        this.approvalRepository = approvalRepository;
        this.commentRepository = commentRepository;
        this.notificationHelper = notificationHelper;
        this.userRepository = userRepository;
    }

    // ==================== TEACHER ENDPOINTS ====================

    /**
     * Teacher submits a course file for review
     */
    @PostMapping("/teacher/course-files/{id}/submit")
    public ResponseEntity<Map<String, Object>> submitCourseFile(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user) {

        CourseFile courseFile = courseFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course file not found"));

        // Verify ownership
        if (!courseFile.getCreatedBy().getId().equals(user.getTeacher().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to submit this course file"));
        }

        // Check if already submitted
        if (!"DRAFT".equals(courseFile.getStatus()) && !"RETURNED_BY_SUBJECT_HEAD".equals(courseFile.getStatus())
                && !"RETURNED_BY_HOD".equals(courseFile.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Course file is not in a submittable state"));
        }

        // Update status
        courseFile.setStatus("SUBMITTED");
        courseFileRepository.save(courseFile);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Course file submitted successfully");
        response.put("status", courseFile.getStatus());
        response.put("submittedAt", LocalDateTime.now());

        return ResponseEntity.ok(response);
    }

    /**
     * Get course file status
     */
    @GetMapping("/teacher/course-files/{id}/status")
    public ResponseEntity<Map<String, Object>> getCourseFileStatus(
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

        // Get latest approval info if exists
        Optional<Approval> latestApproval = approvalRepository.findTopByCourseFile_IdOrderByActedAtDesc(id);
        if (latestApproval.isPresent()) {
            Approval approval = latestApproval.get();
            response.put("lastAction", Map.of(
                    "stage", approval.getStage(),
                    "status", approval.getStatus(),
                    "comment", approval.getComment() != null ? approval.getComment() : "",
                    "actedAt", approval.getActedAt()));
        }

        return ResponseEntity.ok(response);
    }

    // ==================== SUBJECT HEAD ENDPOINTS ====================

    /**
     * Get pending approvals for Subject Head
     * Returns course files with status SUBMITTED where the user is the assigned
     * Subject Head
     */
    @GetMapping("/subject-head/pending-approvals")
    public ResponseEntity<List<Map<String, Object>>> getSubjectHeadPendingApprovals(
            @AuthenticationPrincipal CustomUserDetails user) {

        Teacher teacher = user.getTeacher();
        if (teacher == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Use new query that filters by specific Subject Head assignment for each
        // course
        List<CourseFile> pendingFiles = courseFileRepository.findPendingForSubjectHead(teacher.getId());

        List<Map<String, Object>> result = new ArrayList<>();
        for (CourseFile cf : pendingFiles) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", cf.getId());
            item.put("courseFileId", cf.getId());
            item.put("courseCode", cf.getCourse().getCode());
            item.put("courseTitle", cf.getCourse().getTitle());
            item.put("teacherName", cf.getCreatedBy().getName());
            item.put("teacherId", cf.getCreatedBy().getId());
            item.put("academicYear", cf.getAcademicYear());
            item.put("section", cf.getSection());
            item.put("status", cf.getStatus());
            item.put("submittedDate", cf.getCreatedAt());
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Get courses assigned to Subject Head (all courses in department)
     */
    @GetMapping("/subject-head/assigned-courses")
    public ResponseEntity<List<Map<String, Object>>> getSubjectHeadAssignedCourses(
            @AuthenticationPrincipal CustomUserDetails user) {

        Teacher teacher = user.getTeacher();
        if (teacher == null || teacher.getDepartment() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        Long departmentId = teacher.getDepartment().getId();
        List<CourseFile> allFiles = courseFileRepository.findByDepartmentId(departmentId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (CourseFile cf : allFiles) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", cf.getId());
            item.put("courseCode", cf.getCourse().getCode());
            item.put("courseTitle", cf.getCourse().getTitle());
            item.put("teacherName", cf.getCreatedBy().getName());
            item.put("academicYear", cf.getAcademicYear());
            item.put("status", cf.getStatus());
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Subject Head approves and forwards to HOD
     */
    @PostMapping("/subject-head/approvals/{courseFileId}/approve")
    public ResponseEntity<Map<String, Object>> subjectHeadApprove(
            @PathVariable Long courseFileId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails user) {

        CourseFile courseFile = courseFileRepository.findById(courseFileId)
                .orElseThrow(() -> new RuntimeException("Course file not found"));

        if (!"SUBMITTED".equals(courseFile.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Course file is not submitted for review"));
        }

        // Create approval record
        Approval approval = new Approval();
        approval.setCourseFile(courseFile);
        approval.setApprover(user.getTeacher());
        approval.setStage("SUBJECT_HEAD");
        approval.setStatus("APPROVED");
        approval.setComment(body.getOrDefault("comment", "Forwarded to HOD for final approval"));
        approval.setActedAt(LocalDateTime.now());
        approvalRepository.save(approval);

        // Update course file status
        courseFile.setStatus("UNDER_REVIEW_HOD");
        courseFileRepository.save(courseFile);

        return ResponseEntity.ok(Map.of(
                "message", "Course file approved and forwarded to HOD",
                "status", courseFile.getStatus()));
    }

    /**
     * Subject Head returns to teacher
     */
    @PostMapping("/subject-head/approvals/{courseFileId}/return")
    public ResponseEntity<Map<String, Object>> subjectHeadReturn(
            @PathVariable Long courseFileId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails user) {

        CourseFile courseFile = courseFileRepository.findById(courseFileId)
                .orElseThrow(() -> new RuntimeException("Course file not found"));

        if (!"SUBMITTED".equals(courseFile.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Course file is not submitted for review"));
        }

        String comment = body.get("comment");
        if (comment == null || comment.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Comment is required when returning a course file"));
        }

        // Create approval record
        Approval approval = new Approval();
        approval.setCourseFile(courseFile);
        approval.setApprover(user.getTeacher());
        approval.setStage("SUBJECT_HEAD");
        approval.setStatus("RETURNED");
        approval.setComment(comment);
        approval.setActedAt(LocalDateTime.now());
        approvalRepository.save(approval);

        // Create a comment record so it appears in Comments & Discussions
        Comment returnComment = new Comment();
        returnComment.setCourseFile(courseFile);
        returnComment.setAuthor(user.getTeacher());
        returnComment.setText("[RETURNED] " + comment);
        returnComment.setCreatedAt(LocalDateTime.now());
        returnComment.setIsReceived(false);
        commentRepository.save(returnComment);

        // Update course file status
        courseFile.setStatus("RETURNED_BY_SUBJECT_HEAD");
        courseFileRepository.save(courseFile);

        return ResponseEntity.ok(Map.of(
                "message", "Course file returned to teacher",
                "status", courseFile.getStatus()));
    }

    // ==================== HOD ENDPOINTS ====================

    /**
     * Get pending approvals for HOD (forwarded by Subject Head)
     */
    @GetMapping("/hod/pending-approvals")
    public ResponseEntity<List<Map<String, Object>>> getHodPendingApprovals(
            @AuthenticationPrincipal CustomUserDetails user) {

        Teacher teacher = user.getTeacher();
        if (teacher == null || teacher.getDepartment() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        Long departmentId = teacher.getDepartment().getId();
        List<CourseFile> pendingFiles = courseFileRepository.findByDepartmentIdAndStatus(departmentId,
                "UNDER_REVIEW_HOD");

        List<Map<String, Object>> result = new ArrayList<>();
        for (CourseFile cf : pendingFiles) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", cf.getId());
            item.put("courseFileId", cf.getId());
            item.put("courseCode", cf.getCourse().getCode());
            item.put("courseTitle", cf.getCourse().getTitle());
            item.put("teacherName", cf.getCreatedBy().getName());
            item.put("academicYear", cf.getAcademicYear());
            item.put("section", cf.getSection());
            item.put("status", cf.getStatus());

            // Get Subject Head approval info
            Optional<Approval> subjectHeadApproval = approvalRepository
                    .findTopByCourseFile_IdOrderByActedAtDesc(cf.getId());
            if (subjectHeadApproval.isPresent()) {
                item.put("forwardedBy", subjectHeadApproval.get().getApprover().getName());
                item.put("forwardedAt", subjectHeadApproval.get().getActedAt());
                item.put("subjectHeadComment", subjectHeadApproval.get().getComment());
            }

            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * HOD gives final approval
     */
    @PostMapping("/hod/approvals/{courseFileId}/approve")
    public ResponseEntity<Map<String, Object>> hodApprove(
            @PathVariable Long courseFileId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails user) {

        CourseFile courseFile = courseFileRepository.findById(courseFileId)
                .orElseThrow(() -> new RuntimeException("Course file not found"));

        if (!"UNDER_REVIEW_HOD".equals(courseFile.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Course file is not pending HOD approval"));
        }

        // Create approval record
        Approval approval = new Approval();
        approval.setCourseFile(courseFile);
        approval.setApprover(user.getTeacher());
        approval.setStage("HOD");
        approval.setStatus("APPROVED");
        approval.setComment(body.getOrDefault("comment", "Final approval granted"));
        approval.setActedAt(LocalDateTime.now());
        approvalRepository.save(approval);

        // Update course file status
        courseFile.setStatus("APPROVED");
        courseFileRepository.save(courseFile);

        return ResponseEntity.ok(Map.of(
                "message", "Course file has been approved",
                "status", courseFile.getStatus()));
    }

    /**
     * HOD returns to teacher
     */
    @PostMapping("/hod/approvals/{courseFileId}/return")
    public ResponseEntity<Map<String, Object>> hodReturn(
            @PathVariable Long courseFileId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails user) {

        CourseFile courseFile = courseFileRepository.findById(courseFileId)
                .orElseThrow(() -> new RuntimeException("Course file not found"));

        if (!"UNDER_REVIEW_HOD".equals(courseFile.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Course file is not pending HOD approval"));
        }

        String comment = body.get("comment");
        if (comment == null || comment.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Comment is required when returning a course file"));
        }

        // Create approval record
        Approval approval = new Approval();
        approval.setCourseFile(courseFile);
        approval.setApprover(user.getTeacher());
        approval.setStage("HOD");
        approval.setStatus("RETURNED");
        approval.setComment(comment);
        approval.setActedAt(LocalDateTime.now());
        approvalRepository.save(approval);

        // Create a comment record so it appears in Comments & Discussions
        Comment returnComment = new Comment();
        returnComment.setCourseFile(courseFile);
        returnComment.setAuthor(user.getTeacher());
        returnComment.setText("[RETURNED BY HOD] " + comment);
        returnComment.setCreatedAt(LocalDateTime.now());
        returnComment.setIsReceived(false);
        commentRepository.save(returnComment);

        // Update course file status
        courseFile.setStatus("RETURNED_BY_HOD");
        courseFileRepository.save(courseFile);

        return ResponseEntity.ok(Map.of(
                "message", "Course file returned to teacher",
                "status", courseFile.getStatus()));
    }

    /**
     * Get approval history for a course file
     */
    @GetMapping("/approvals/{courseFileId}/history")
    public ResponseEntity<List<Map<String, Object>>> getApprovalHistory(
            @PathVariable Long courseFileId,
            @AuthenticationPrincipal CustomUserDetails user) {

        List<Approval> approvals = approvalRepository.findByCourseFile_Id(courseFileId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Approval approval : approvals) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", approval.getId());
            item.put("stage", approval.getStage());
            item.put("status", approval.getStatus());
            item.put("comment", approval.getComment());
            item.put("approverName", approval.getApprover().getName());
            item.put("actedAt", approval.getActedAt());
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }
}
