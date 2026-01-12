package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.CourseFile;
import com.mitmeerut.CFM_Portal.Service.CourseFileService;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher/course-file")
public class CourseFileController {

    private CourseFileService courseFileService;
    @Autowired
    public CourseFileController(CourseFileService courseFileService) {
        this.courseFileService = courseFileService;
    }

    @PostMapping("/{courseId}")
    public CourseFile createCourseFile(@PathVariable Long courseId, @AuthenticationPrincipal CustomUserDetails user){
        return courseFileService.createCourseFile(courseId, user);
    }
}
