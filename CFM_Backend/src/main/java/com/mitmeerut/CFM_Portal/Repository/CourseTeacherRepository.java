package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.mitmeerut.CFM_Portal.Model.CourseTeacher;

@Repository
public interface CourseTeacherRepository extends JpaRepository<CourseTeacher, Long> {
    List<CourseTeacher> findByTeacher_Id(Long teacherId);
    List<CourseTeacher> findByCourse_Id(Long courseId);
    boolean existsByCourse_IdAndTeacher_Id(Long courseId, Long teacherId);
}
