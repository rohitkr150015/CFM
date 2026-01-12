package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Course;
import com.mitmeerut.CFM_Portal.Model.Program;
import com.mitmeerut.CFM_Portal.Model.User;
import com.mitmeerut.CFM_Portal.Repository.CourseRepository;
import com.mitmeerut.CFM_Portal.Repository.ProgramRepository;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {
    private CourseRepository courseRepo;
    private ProgramRepository programRepo;

    @Autowired
    public CourseServiceImpl(CourseRepository courseRepo, ProgramRepository programRepo) {
        this.courseRepo = courseRepo;
        this.programRepo = programRepo;
    }

    @Override
    public Course createCourse(Course course, CustomUserDetails user) {
        if (user.getRole() != User.userRole.HOD && user.getRole() != User.userRole.TEACHER) {
            throw new RuntimeException("Only HOD or TEACHER allowed!");
        }
        Long hodDeptId = user.getTeacher().getDepartment().getId();
        Program program = programRepo.findById(course.getProgramId())
                .orElseThrow(() -> new RuntimeException("Program not found!"));
        if (!program.getDepartment().getId().equals(hodDeptId)) {
            throw new RuntimeException("you cannot add course for another department!");
        }
        return courseRepo.save(course);
    }

    @Override
    public List<Course> getCoursesForHod(CustomUserDetails user) {
        Long deptId = user.getTeacher().getDepartment().getId();
        return courseRepo.findByDepartmentId(deptId);
    }

    @Override
    public Course updateCourse(Long id, Course updated, CustomUserDetails user) {
        Course existing = courseRepo.findById(id).orElseThrow(() -> new RuntimeException("course not found!"));
        existing.setCode(updated.getCode());
        existing.setTitle(updated.getTitle());
        existing.setCredits(updated.getCredits());
        existing.setContactHour(updated.getContactHour());
        return courseRepo.save(existing);
    }

    @Override
    public void deleteCourse(Long id, CustomUserDetails user) {
        courseRepo.deleteById(id);
    }
}
