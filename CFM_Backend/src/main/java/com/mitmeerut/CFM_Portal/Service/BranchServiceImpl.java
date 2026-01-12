package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Branch;
import com.mitmeerut.CFM_Portal.Model.Program;
import com.mitmeerut.CFM_Portal.Repository.BranchRepository;
import com.mitmeerut.CFM_Portal.Repository.ProgramRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;


@Service
public class BranchServiceImpl implements BranchService {

    @Autowired
    private BranchRepository branchRepo;

    @Autowired
    private ProgramRepository programRepo;

    @Override
    public List<Branch> getBranchesByProgram(Long programId) {

        Program p = programRepo.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program Not Found"));

        return branchRepo.findByProgram(p);
    }

    @Override
    public Branch createBranch(Map<String, Object> body) {

        Branch b = new Branch();

        b.setName((String) body.get("name"));
        b.setCode((String) body.get("code"));

        Long programId = Long.valueOf(body.get("program_id").toString());
        Program p = programRepo.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program Not Found"));

        b.setProgram(p);

        return branchRepo.save(b);
    }

    @Override
    public Branch updateBranch(Long id, Map<String, Object> body) {

        Branch b = branchRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch Not Found"));

        if (body.containsKey("name"))
            b.setName((String) body.get("name"));

        if (body.containsKey("code"))
            b.setCode((String) body.get("code"));

        if (body.containsKey("program_id")) {
            Long pid = Long.valueOf(body.get("program_id").toString());
            Program p = programRepo.findById(pid)
                    .orElseThrow(() -> new RuntimeException("Program Not Found"));
            b.setProgram(p);
        }

        return branchRepo.save(b);
    }

    @Override
    public void deleteBranch(Long id) {
        branchRepo.deleteById(id);
    }


}

