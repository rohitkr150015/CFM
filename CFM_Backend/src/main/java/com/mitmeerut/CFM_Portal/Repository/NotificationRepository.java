package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.mitmeerut.CFM_Portal.Model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // find notifications by user
    List<Notification> findByUser_Id(Long userId);

    // notifications for an institute (via user -> teacher -> department -> institute)
    List<Notification> findByUser_Teacher_Department_Institute_Id(Long instituteId);
}
