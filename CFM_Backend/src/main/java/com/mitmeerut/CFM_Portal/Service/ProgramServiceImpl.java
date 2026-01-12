package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Department;
import com.mitmeerut.CFM_Portal.Model.Program;
import com.mitmeerut.CFM_Portal.Repository.DepartmentRepository;
import com.mitmeerut.CFM_Portal.Repository.ProgramRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ProgramServiceImpl implements ProgramService {

    @Autowired
    private ProgramRepository programRepo;

    @Autowired
    private DepartmentRepository departmentRepo;

    @Override
    public List<Program> getAllPrograms() {
        return programRepo.findAll();
    }

    @Override
    public Program createProgram(Map<String, Object> body) {

        Program p = new Program();

        p.setName((String) body.get("name"));
        p.setCode((String) body.get("code"));
        p.setDegree_type((String) body.get("degree_type"));
        p.setDuration_year(Integer.valueOf(body.get("duration_year").toString()));

        Long deptId = Long.valueOf(body.get("department_id").toString());
        Department d = departmentRepo.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department Not Found"));

        p.setDepartment(d);

        return programRepo.save(p);
    }

    @Override
    public Program updateProgram(Long id, Map<String, Object> body) {

        Program p = programRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Program Not Found"));

        if (body.containsKey("name"))
            p.setName((String) body.get("name"));

        if (body.containsKey("code"))
            p.setCode((String) body.get("code"));

        if (body.containsKey("degree_type"))
            p.setDegree_type((String) body.get("degree_type"));

        if (body.containsKey("duration_year"))
            p.setDuration_year(Integer.valueOf(body.get("duration_year").toString()));

        if (body.containsKey("department_id")) {
            Long deptId = Long.valueOf(body.get("department_id").toString());
            Department d = departmentRepo.findById(deptId)
                    .orElseThrow(() -> new RuntimeException("Department Not Found"));
            p.setDepartment(d);
        }

        return programRepo.save(p);
    }

    @Override
    public void deleteProgram(Long id) {
        programRepo.deleteById(id);
    }
}
