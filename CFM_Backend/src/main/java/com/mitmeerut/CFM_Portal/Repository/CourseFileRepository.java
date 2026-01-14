package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.mitmeerut.CFM_Portal.Model.CourseFile;

@Repository
public interface CourseFileRepository extends JpaRepository<CourseFile, Long> {

        List<CourseFile> findByCreatedById(Long teacherId);

        List<CourseFile> findByStatus(String status);

        List<CourseFile> findByStatusIn(List<String> statuses);

        // Find course files by department (through course -> program -> department)
        @Query("SELECT cf FROM CourseFile cf JOIN Program p ON cf.course.programId = p.id WHERE p.department.id = :departmentId")
        List<CourseFile> findByDepartmentId(@Param("departmentId") Long departmentId);

        // Find course files by department and status
        @Query("SELECT cf FROM CourseFile cf JOIN Program p ON cf.course.programId = p.id WHERE p.department.id = :departmentId AND cf.status = :status")
        List<CourseFile> findByDepartmentIdAndStatus(@Param("departmentId") Long departmentId,
                        @Param("status") String status);

        // Find course files by department and multiple statuses
        @Query("SELECT cf FROM CourseFile cf JOIN Program p ON cf.course.programId = p.id WHERE p.department.id = :departmentId AND cf.status IN :statuses")
        List<CourseFile> findByDepartmentIdAndStatusIn(@Param("departmentId") Long departmentId,
                        @Param("statuses") List<String> statuses);
}
