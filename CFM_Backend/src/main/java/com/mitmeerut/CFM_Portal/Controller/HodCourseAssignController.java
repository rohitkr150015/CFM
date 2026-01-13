package com.mitmeerut.CFM_Portal.Controller;


import com.mitmeerut.CFM_Portal.Service.CourseTeacherService;
import com.mitmeerut.CFM_Portal.dto.AssignCourseDTO;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


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
    public void assignCourse(@RequestBody AssignCourseDTO dto,@AuthenticationPrincipal CustomUserDetails user){
        courseTeacherService.assignCourse(dto,user);
    }

}