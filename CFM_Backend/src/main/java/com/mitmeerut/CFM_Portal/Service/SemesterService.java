package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Semester;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface SemesterService {

    List<Semester> getSemesters(Long programId, Long branchId);

    Semester createSemester(Map<String, Object> body);

    Semester updateSemester(Long id, Map<String, Object> body);

    void deleteSemester(Long id);
}

