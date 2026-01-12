package com.mitmeerut.CFM_Portal.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.mitmeerut.CFM_Portal.Model.Branch;
import com.mitmeerut.CFM_Portal.Service.BranchService;

@RestController
@RequestMapping("/api/branch")
@CrossOrigin(origins = "http://localhost:5000")
public class BranchController {

    @Autowired
    private BranchService branchService;

    @GetMapping
    public List<Branch> getBranches(@RequestParam Long programId) {
        return branchService.getBranchesByProgram(programId);
    }

    @PostMapping
    public Branch createBranch(@RequestBody Map<String, Object> body) {
        return branchService.createBranch(body);
    }

    @PutMapping("/{id}")
    public Branch updateBranch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return branchService.updateBranch(id, body);
    }

    @DeleteMapping("/{id}")
    public String deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return "Branch Deleted";
    }
}

