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

        // Group by course to show all teachers and identify Subject Head
        Map<Long, List<CourseTeacher>> groupedByCourse = assignments.stream()
                .collect(Collectors.groupingBy(ct -> ct.getCourse().getId()));

        List<Map<String, Object>> result = new ArrayList<>();

        for (Map.Entry<Long, List<CourseTeacher>> entry : groupedByCourse.entrySet()) {
            List<CourseTeacher> courseAssignments = entry.getValue();
            if (!courseAssignments.isEmpty()) {
                CourseTeacher first = courseAssignments.get(0);

                Map<String, Object> item = new HashMap<>();
                item.put("courseId", first.getCourse().getId());
                item.put("courseCode", first.getCourse().getCode());
                item.put("courseTitle", first.getCourse().getTitle());

                // Get all teachers for this course
                List<Map<String, Object>> teachers = courseAssignments.stream()
                        .map(ct -> {
                            Map<String, Object> teacherInfo = new HashMap<>();
                            teacherInfo.put("teacherId", ct.getTeacher().getId());
                            teacherInfo.put("teacherName", ct.getTeacher().getName());
                            teacherInfo.put("section", ct.getSection());
                            teacherInfo.put("academicYear", ct.getAcademicYear());
                            teacherInfo.put("isSubjectHead", ct.getIsSubjectHead());
                            return teacherInfo;
                        })
                        .collect(Collectors.toList());

                item.put("teachers", teachers);

                // Find Subject Head
                Optional<CourseTeacher> subjectHead = courseAssignments.stream()
                        .filter(ct -> ct.getIsSubjectHead() != null && ct.getIsSubjectHead())
                        .findFirst();

                if (subjectHead.isPresent()) {
                    item.put("subjectHeadId", subjectHead.get().getTeacher().getId());
                    item.put("subjectHeadName", subjectHead.get().getTeacher().getName());
                } else {
                    item.put("subjectHeadId", null);
                    item.put("subjectHeadName", "Not Assigned");
                }

                result.add(item);
            }
        }

        return ResponseEntity.ok(result);
    }

}