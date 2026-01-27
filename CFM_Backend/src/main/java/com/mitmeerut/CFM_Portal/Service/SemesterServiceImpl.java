package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Branch;
import com.mitmeerut.CFM_Portal.Model.Program;
import com.mitmeerut.CFM_Portal.Model.Semester;
import com.mitmeerut.CFM_Portal.Repository.BranchRepository;
import com.mitmeerut.CFM_Portal.Repository.ProgramRepository;
import com.mitmeerut.CFM_Portal.Repository.SemesterRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SemesterServiceImpl implements SemesterService {

    @Autowired
    private SemesterRepository semesterRepo;

    @Autowired
    private ProgramRepository programRepo;

    @Autowired
    private BranchRepository branchRepo;

    @Override
    public List<Semester> getSemesters(Long programId, Long branchId) {

        Program p = programRepo.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program Not Found"));

        Branch b = branchRepo.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch Not Found"));

        return semesterRepo.findByProgramAndBranch(p, b);
    }

    @Override
    public Semester createSemester(Map<String, Object> body) {

        Semester s = new Semester();

        s.setLabel((String) body.get("label"));
        s.setSemester_number(Integer.valueOf(body.get("semester_number").toString()));

        Program p = programRepo.findById(Long.valueOf(body.get("program_id").toString()))
                .orElseThrow(() -> new RuntimeException("Program Not Found"));
        s.setProgram(p);

        Branch b = branchRepo.findById(Long.valueOf(body.get("branch_id").toString()))
                .orElseThrow(() -> new RuntimeException("Branch Not Found"));
        s.setBranch(b);

        return semesterRepo.save(s);
    }

    @Override
    public Semester updateSemester(Long id, Map<String, Object> body) {

        Semester s = semesterRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Semester Not Found"));

        if (body.containsKey("label"))
            s.setLabel((String) body.get("label"));

        if (body.containsKey("semester_number"))
            s.setSemester_number(Integer.valueOf(body.get("semester_number").toString()));

        if (body.containsKey("program_id")) {
            Program p = programRepo.findById(Long.valueOf(body.get("program_id").toString()))
                    .orElseThrow(() -> new RuntimeException("Program Not Found"));
            s.setProgram(p);
        }

        if (body.containsKey("branch_id")) {
            Branch b = branchRepo.findById(Long.valueOf(body.get("branch_id").toString()))
                    .orElseThrow(() -> new RuntimeException("Branch Not Found"));
            s.setBranch(b);
        }

        return semesterRepo.save(s);
    }

    @Override
    public void deleteSemester(Long id) {
        semesterRepo.deleteById(id);
    }

    @Override
    public List<Semester> getAllSemesters() {
        return semesterRepo.findAll();
    }
}
