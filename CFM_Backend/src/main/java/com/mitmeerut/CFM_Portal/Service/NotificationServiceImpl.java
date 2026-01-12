package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Notification;
import com.mitmeerut.CFM_Portal.Repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    public NotificationServiceImpl(NotificationRepository notificationRepository){ this.notificationRepository = notificationRepository; }

    @Override public Notification send(Notification notification){ return notificationRepository.save(notification); }
    @Override public List<Notification> findByUserId(Long userId){ return notificationRepository.findByUser_Id(userId); }
    @Override public List<Notification> findByInstituteId(Long instituteId){ return notificationRepository.findByUser_Teacher_Department_Institute_Id(instituteId); }
    @Override public Optional<Notification> findById(Long id){ return notificationRepository.findById(id); }
    @Override public void delete(Long id){ notificationRepository.deleteById(id); }
}
