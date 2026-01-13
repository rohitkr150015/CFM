package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Department;
import com.mitmeerut.CFM_Portal.Model.Institute;
import com.mitmeerut.CFM_Portal.Model.Teacher;
import com.mitmeerut.CFM_Portal.Repository.DepartmentRepository;
import com.mitmeerut.CFM_Portal.Repository.InstituteRepository;
import com.mitmeerut.CFM_Portal.Repository.TeacherRepository;
import com.mitmeerut.CFM_Portal.dto.DepartmentDTO;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepo;

    @Autowired
    private InstituteRepository instituteRepo;

    @Autowired
    private TeacherRepository teacherRepo;


    @Override
    public List<Department> getAllDepartments() {
        return departmentRepo.findAll();
    }

    @Override
    public Department getDepartmentById(Long id) {
        return departmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }


    @Override
    public Department createDepartment(DepartmentDTO dto) {
        Department dept = new Department();
        mapDtoToEntity(dto, dept);
        return departmentRepo.save(dept);
    }



    @Override
    public Department updateDepartment(Long id, DepartmentDTO dto) {
        Department dept = getDepartmentById(id);
        mapDtoToEntity(dto, dept);
        return departmentRepo.save(dept);
    }



    @Override
    public String checkBeforeDelete(Long departmentId) {

        if (!departmentRepo.existsById(departmentId)) {
            throw new RuntimeException("Department not found");
        }

        return "This department and all related data will be deleted. Do you want to continue?";
    }



    @Override
    @Transactional
    public void confirmDeleteDepartment(Long departmentId) {

        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        // Clear the HOD reference from department
        Teacher hod = dept.getHod();
        if (hod != null) {
            hod.setDepartment(null);
            teacherRepo.save(hod);
        }
        dept.setHod(null);

        // Clear department reference from all teachers in this department
        List<Teacher> teachers = teacherRepo.findByDepartmentId(departmentId);
        for (Teacher teacher : teachers) {
            teacher.setDepartment(null);
            teacherRepo.save(teacher);
        }

        departmentRepo.delete(dept);
    }

    private void mapDtoToEntity(DepartmentDTO dto, Department dept) {

        // Institute (REQUIRED)
        Institute institute = instituteRepo.findById(dto.getInstituteId())
                .orElseThrow(() -> new RuntimeException("Institute not found"));

        dept.setName(dto.getName());
        dept.setCode(dto.getCode());
        dept.setInstitute(institute);

        // HOD (OPTIONAL)
        if (dto.getHodId() != null) {
            Teacher hod = teacherRepo.findById(dto.getHodId())
                    .orElseThrow(() -> new RuntimeException("HOD not found"));
            dept.setHod(hod);

            hod.setDepartment(dept);
        } else {
            dept.setHod(null);
        }
    }
}
