package com.mitmeerut.CFM_Portal.Repository;

import com.mitmeerut.CFM_Portal.Model.Department;
import com.mitmeerut.CFM_Portal.Model.Teacher;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Teacher findByEmailOfficial(String emailOfficial);
  
    List<Teacher> findByDepartment(Department department);
    
    List<Teacher> findByDepartmentId(Long departmentId);

}
