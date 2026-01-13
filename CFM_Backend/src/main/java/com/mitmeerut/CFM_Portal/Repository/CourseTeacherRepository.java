package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.mitmeerut.CFM_Portal.Model.CourseTeacher;

@Repository
public interface CourseTeacherRepository extends JpaRepository<CourseTeacher, Long> {
    boolean existsByCourseIdAndTeacherIdAndAcademicYearAndSection(Long courseId,Long teacherId,String academicYear,String  section);
    @Query("""
    SELECT ct
    FROM CourseTeacher ct
    WHERE ct.teacher.id = :teacherId
""")
    List<CourseTeacher> findByTeacherId(@Param("teacherId") Long teacherId);
}