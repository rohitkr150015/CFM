package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.CourseTeacher;
import com.mitmeerut.CFM_Portal.Model.Teacher;
import com.mitmeerut.CFM_Portal.Model.Template;
import com.mitmeerut.CFM_Portal.Repository.CourseTeacherRepository;
import com.mitmeerut.CFM_Portal.Repository.TemplateRepository;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
public class TeacherCourseController {

    private final CourseTeacherRepository courseTeacherRepo;
    private final TemplateRepository templateRepo;

    @Autowired
    public TeacherCourseController(
            CourseTeacherRepository courseTeacherRepo,
            TemplateRepository templateRepo
    ) {
        this.courseTeacherRepo = courseTeacherRepo;
        this.templateRepo = templateRepo;
    }

    @GetMapping("/my-courses")
    public List<Map<String, Object>> getMyCourses(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Teacher teacher = user.getTeacher();

        return courseTeacherRepo.findByTeacherId(teacher.getId())
                .stream()
                .map(ct -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("courseId", ct.getCourse().getId());
                    map.put("code", ct.getCourse().getCode());
                    map.put("title", ct.getCourse().getTitle());
                    map.put("academicYear", ct.getAcademicYear());
                    map.put("section", ct.getSection());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/templates")
    public List<Template> getTemplates(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Long deptId = user.getTeacher().getDepartment().getId();
        return templateRepo.findByDepartmentId(deptId);
    }
}
