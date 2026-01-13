package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.mitmeerut.CFM_Portal.Model.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    @Query("""
            SELECT c
            FROM Course c
            JOIN Program p ON c.programId=p.id
            WHERE p.department.id=:departmentId
            """)
    List<Course> findByDepartmentId(Long departmentId);


    @Query("""
        SELECT p.department.id
        FROM Program p
        WHERE p.id = :programId
    """)
    Long findDepartmentIdByProgramId(@Param("programId") Long programId);
}

