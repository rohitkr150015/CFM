package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.CourseTeacher;
import com.mitmeerut.CFM_Portal.Service.CourseTeacherService;
import com.mitmeerut.CFM_Portal.dto.AssignCourseDTO;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hod")
public class HodCourseAssignController {

    private CourseTeacherService courseTeacherService;

    @Autowired
    public HodCourseAssignController(CourseTeacherService courseTeacherService) {
        this.courseTeacherService = courseTeacherService;
    }

    @PostMapping("/assign-course")
    @PreAuthorize("hasRole('HOD')")
    public void assignCourse(@RequestBody AssignCourseDTO dto, @AuthenticationPrincipal CustomUserDetails user) {
        courseTeacherService.assignCourse(dto, user);
    }

    @GetMapping("/course-assignments")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<List<Map<String, Object>>> getCourseAssignments(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<CourseTeacher> assignments = courseTeacherService.getAllAssignmentsForDepartment(user);

        // Return flat list of individual assignments for easier edit/delete
        List<Map<String, Object>> result = assignments.stream()
                .map(ct -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", ct.getId());
                    item.put("courseId", ct.getCourse().getId());
                    item.put("courseCode", ct.getCourse().getCode());
                    item.put("courseTitle", ct.getCourse().getTitle());
                    item.put("teacherId", ct.getTeacher().getId());
                    item.put("teacherName", ct.getTeacher().getName());
                    item.put("section", ct.getSection());
                    item.put("academicYear", ct.getAcademicYear());
                    item.put("isSubjectHead", ct.getIsSubjectHead() != null ? ct.getIsSubjectHead() : false);
                    return item;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/course-assignments/{id}")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> updateAssignment(
            @PathVariable Long id,
            @RequestBody AssignCourseDTO dto,
            @AuthenticationPrincipal CustomUserDetails user) {
        try {
            courseTeacherService.updateAssignment(id, dto, user);
            return ResponseEntity.ok(Map.of("message", "Assignment updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/course-assignments/{id}")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> deleteAssignment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user) {
        try {
            courseTeacherService.deleteAssignment(id, user);
            return ResponseEntity.ok(Map.of("message", "Assignment deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

}