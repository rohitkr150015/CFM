package com.mitmeerut.CFM_Portal.Repository;

import com.mitmeerut.CFM_Portal.Model.Branch;
import com.mitmeerut.CFM_Portal.Model.Program;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByProgram(Program program);
    
}
