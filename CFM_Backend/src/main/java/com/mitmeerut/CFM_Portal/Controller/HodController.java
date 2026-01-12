package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.*;
import com.mitmeerut.CFM_Portal.Repository.*;
import com.mitmeerut.CFM_Portal.dto.FacultyDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/hod")
@CrossOrigin(origins = "http://localhost:5000", allowCredentials = "true")
public class HodController {

    private final TeacherRepository teacherRepo;
    private final UserRepository userRepo;

    public HodController(
            TeacherRepository teacherRepo,
            UserRepository userRepo
    ) {
        this.teacherRepo = teacherRepo;
        this.userRepo = userRepo;
    }

    // ================= GET FACULTY =================
    @GetMapping("/faculty")
    public List<FacultyDto> getFaculty(
            @AuthenticationPrincipal CustomUserDetails user
    ) {

        if (user == null) {
            throw new RuntimeException("Unauthorized");
        }

        if (user.getRole() != User.userRole.HOD) {
            throw new RuntimeException("Access denied");
        }

        Teacher hodTeacher = user.getTeacher();
        if (hodTeacher == null || hodTeacher.getDepartment() == null) {
            throw new RuntimeException("Department not linked");
        }

        Department dept = hodTeacher.getDepartment();

        return teacherRepo.findByDepartment(dept)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ================= UPDATE FACULTY =================
    @PutMapping("/faculty/{teacherId}")
    public FacultyDto updateFaculty(
            @PathVariable Long teacherId,
            @RequestBody FacultyDto dto,
            @AuthenticationPrincipal CustomUserDetails user
    ) {

        if (user.getRole() != User.userRole.HOD) {
            throw new RuntimeException("Access denied");
        }

        Teacher teacher = teacherRepo.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        User facultyUser = userRepo.findByTeacher(teacher)
                .orElseThrow(() -> new RuntimeException("User not found"));

        facultyUser.setRole(User.userRole.valueOf(dto.getRole()));
        teacher.setDesignation(dto.getDesignation());

        userRepo.save(facultyUser);
        teacherRepo.save(teacher);

        return toDto(teacher);
    }

    // ================= DTO =================
    private FacultyDto toDto(Teacher teacher) {
        User u = userRepo.findByTeacher(teacher).orElseThrow();

        FacultyDto dto = new FacultyDto();
        dto.setId(teacher.getId());
        dto.setName(teacher.getName());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole().name());
        dto.setDesignation(teacher.getDesignation());
        dto.setActive(u.getIsActive());
        dto.setDepartmentName(teacher.getDepartment().getName());

        return dto;
    }
}
