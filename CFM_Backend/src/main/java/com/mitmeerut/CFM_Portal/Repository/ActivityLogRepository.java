package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.mitmeerut.CFM_Portal.Model.Activity_Log;

@Repository
public interface ActivityLogRepository extends JpaRepository<Activity_Log, Long> {
    List<Activity_Log> findByActor_Id(Long teacherId);
}
