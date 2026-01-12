package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import com.mitmeerut.CFM_Portal.Model.Branch;
import com.mitmeerut.CFM_Portal.Model.Program;
import com.mitmeerut.CFM_Portal.Model.Semester;

public interface SemesterRepository extends JpaRepository<Semester, Long> {

    List<Semester> findByProgramAndBranch(Program program, Branch branch);
}
