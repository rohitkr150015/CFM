package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.CourseFile;
import com.mitmeerut.CFM_Portal.Service.CourseFileService;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/teacher/course-files")
public class CourseFileController {

    private final CourseFileService courseFileService;

    @Autowired
    public CourseFileController(CourseFileService courseFileService) {
        this.courseFileService = courseFileService;
    }

    @PostMapping
    public CourseFile createCourseFile(
            @RequestBody com.mitmeerut.CFM_Portal.dto.CreateCourseFileRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        return courseFileService.createCourseFile(request, user);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyCourseFiles(
            @AuthenticationPrincipal CustomUserDetails user) {
        Long teacherId = user.getTeacher().getId();
        List<CourseFile> courseFiles = courseFileService.getCourseFilesByTeacher(teacherId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (CourseFile cf : courseFiles) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", cf.getId());
            item.put("academicYear", cf.getAcademicYear());
            item.put("section", cf.getSection());
            item.put("status", cf.getStatus());
            item.put("createdAt", cf.getCreatedAt());

            // Include course info
            if (cf.getCourse() != null) {
                Map<String, Object> courseInfo = new HashMap<>();
                courseInfo.put("id", cf.getCourse().getId());
                courseInfo.put("code", cf.getCourse().getCode());
                courseInfo.put("title", cf.getCourse().getTitle());
                item.put("course", courseInfo);
            }

            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCourseFile(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user) {
        // In a real app, you should check if the user owns this course file or is admin
        courseFileService.deleteCourseFile(id);
        return ResponseEntity.ok(Map.of("message", "Course file deleted successfully"));
    }
}
