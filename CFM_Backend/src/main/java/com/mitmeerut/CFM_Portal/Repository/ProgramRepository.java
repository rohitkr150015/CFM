package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.mitmeerut.CFM_Portal.Model.Program;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {
    List<Program> findByDepartment_Id(Long departmentId);
    
   
}
