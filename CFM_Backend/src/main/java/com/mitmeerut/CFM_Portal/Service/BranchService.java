package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Branch;

import java.util.List;
import java.util.Map;

public interface BranchService {

    List<Branch> getBranchesByProgram(Long programId);

    Branch createBranch(Map<String, Object> body);

    Branch updateBranch(Long id, Map<String, Object> body);

    void deleteBranch(Long id);
}
