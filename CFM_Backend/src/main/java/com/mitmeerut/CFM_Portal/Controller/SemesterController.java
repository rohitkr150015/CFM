package com.mitmeerut.CFM_Portal.Controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;

import com.mitmeerut.CFM_Portal.Model.Semester;
import com.mitmeerut.CFM_Portal.Service.SemesterService;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/semester")
@CrossOrigin(origins = "http://localhost:5000")
public class SemesterController {

    @Autowired
    private SemesterService semesterService;

    @GetMapping
    public List<Semester> getSemesters(
            @RequestParam Long programId,
            @RequestParam Long branchId) {
        return semesterService.getSemesters(programId, branchId);
    }

    @GetMapping("/all")
    public List<Semester> getAllSemesters() {
        return semesterService.getAllSemesters();
    }

    @PostMapping
    public Semester createSemester(@RequestBody Map<String, Object> body) {
        return semesterService.createSemester(body);
    }

    @PutMapping("/{id}")
    public Semester updateSemester(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return semesterService.updateSemester(id, body);
    }

    @DeleteMapping("/{id}")
    public String deleteSemester(@PathVariable Long id) {
        semesterService.deleteSemester(id);
        return "Semester Deleted";
    }
}
