package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.mitmeerut.CFM_Portal.Model.CourseFile;

@Repository
public interface CourseFileRepository extends JpaRepository<CourseFile, Long> {

}
