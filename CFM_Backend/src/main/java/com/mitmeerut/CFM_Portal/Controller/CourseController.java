package com.mitmeerut.CFM_Portal.Controller;

import java.util.List;

import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.mitmeerut.CFM_Portal.Model.Course;
import com.mitmeerut.CFM_Portal.Service.CourseService;


@RestController
@RequestMapping("/api/hod/courses")
@CrossOrigin(
	    origins = "http://localhost:5000",
	    allowCredentials = "true"
	)
public class CourseController {
	
	private CourseService courseService;

	@Autowired
	public CourseController(CourseService courseService) {
		this.courseService = courseService;
	}
	
	@GetMapping
	public List<Course> getCourses(@AuthenticationPrincipal CustomUserDetails user) {
        return courseService.getCoursesForHod(user);
    }
	
	@PostMapping
	public Course create(@RequestBody Course course,@AuthenticationPrincipal CustomUserDetails user) {
		return courseService.createCourse(course,user);
	}
	
	@PutMapping("/{id}")
	public Course update(@PathVariable Long id,@RequestBody Course course,@AuthenticationPrincipal CustomUserDetails user) {
		return courseService.updateCourse(id,course,user);
	}
	
	@DeleteMapping("/{id}")
	public void delte(@PathVariable Long id,@AuthenticationPrincipal CustomUserDetails user) {
		courseService.deleteCourse(id,user);
	}

}
