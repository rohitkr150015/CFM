package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Course;
import com.mitmeerut.CFM_Portal.Model.CourseTeacher;
import com.mitmeerut.CFM_Portal.Model.Teacher;
import com.mitmeerut.CFM_Portal.Repository.CourseRepository;
import com.mitmeerut.CFM_Portal.Repository.CourseTeacherRepository;
import com.mitmeerut.CFM_Portal.Repository.TeacherRepository;
import com.mitmeerut.CFM_Portal.dto.AssignCourseDTO;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseTeacherService {

    private final CourseRepository courseRepo;
    private final TeacherRepository teacherRepo;
    private final CourseTeacherRepository courseTeacherRepo;

    public CourseTeacherService(
            CourseRepository courseRepo,
            TeacherRepository teacherRepo,
            CourseTeacherRepository courseTeacherRepo) {
        this.courseRepo = courseRepo;
        this.teacherRepo = teacherRepo;
        this.courseTeacherRepo = courseTeacherRepo;
    }

    public void assignCourse(AssignCourseDTO dto, CustomUserDetails user) {

        Teacher hod = user.getTeacher();

        Teacher teacher = teacherRepo.findById(dto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!teacher.getDepartment().getId()
                .equals(hod.getDepartment().getId())) {
            throw new AccessDeniedException("Teacher not in your department");
        }

        Course course = courseRepo.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Long courseDeptId = courseRepo.findDepartmentIdByProgramId(course.getProgramId());

        if (!courseDeptId.equals(hod.getDepartment().getId())) {
            throw new AccessDeniedException("Course not in your department");
        }

        if (courseTeacherRepo
                .existsByCourseIdAndTeacherIdAndAcademicYearAndSection(
                        dto.getCourseId(),
                        dto.getTeacherId(),
                        dto.getAcademicYear(),
                        dto.getSection())) {
            throw new RuntimeException("Course already assigned");
        }

        CourseTeacher ct = new CourseTeacher();
        ct.setCourse(course);
        ct.setTeacher(teacher);
        ct.setAcademicYear(dto.getAcademicYear());
        ct.setSection(dto.getSection());
        ct.setIsSubjectHead(dto.getIsSubjectHead() != null ? dto.getIsSubjectHead() : false);

        courseTeacherRepo.save(ct);
    }

    public List<CourseTeacher> getAllAssignmentsForDepartment(CustomUserDetails user) {
        Teacher hod = user.getTeacher();
        Long departmentId = hod.getDepartment().getId();

        // Get all assignments and filter by department
        return courseTeacherRepo.findAll().stream()
                .filter(ct -> {
                    Long courseDeptId = courseRepo.findDepartmentIdByProgramId(ct.getCourse().getProgramId());
                    return courseDeptId != null && courseDeptId.equals(departmentId);
                })
                .collect(Collectors.toList());
    }

    public void updateAssignment(Long id, AssignCourseDTO dto, CustomUserDetails user) {
        Teacher hod = user.getTeacher();

        CourseTeacher ct = courseTeacherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // Verify the assignment belongs to HOD's department
        Long courseDeptId = courseRepo.findDepartmentIdByProgramId(ct.getCourse().getProgramId());
        if (!courseDeptId.equals(hod.getDepartment().getId())) {
            throw new RuntimeException("Assignment not in your department");
        }

        // Update fields
        if (dto.getTeacherId() != null) {
            Teacher teacher = teacherRepo.findById(dto.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            if (!teacher.getDepartment().getId().equals(hod.getDepartment().getId())) {
                throw new RuntimeException("Teacher not in your department");
            }
            ct.setTeacher(teacher);
        }

        if (dto.getCourseId() != null) {
            Course course = courseRepo.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            Long newCourseDeptId = courseRepo.findDepartmentIdByProgramId(course.getProgramId());
            if (!newCourseDeptId.equals(hod.getDepartment().getId())) {
                throw new RuntimeException("Course not in your department");
            }
            ct.setCourse(course);
        }

        if (dto.getAcademicYear() != null) {
            ct.setAcademicYear(dto.getAcademicYear());
        }

        if (dto.getSection() != null) {
            ct.setSection(dto.getSection());
        }

        if (dto.getIsSubjectHead() != null) {
            ct.setIsSubjectHead(dto.getIsSubjectHead());
        }

        courseTeacherRepo.save(ct);
    }

    public void deleteAssignment(Long id, CustomUserDetails user) {
        Teacher hod = user.getTeacher();

        CourseTeacher ct = courseTeacherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // Verify the assignment belongs to HOD's department
        Long courseDeptId = courseRepo.findDepartmentIdByProgramId(ct.getCourse().getProgramId());
        if (!courseDeptId.equals(hod.getDepartment().getId())) {
            throw new RuntimeException("Assignment not in your department");
        }

        courseTeacherRepo.delete(ct);
    }
}
