package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Activity_Log;
import com.mitmeerut.CFM_Portal.Repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {
    private final ActivityLogRepository activityLogRepository;
    public ActivityLogServiceImpl(ActivityLogRepository activityLogRepository){ this.activityLogRepository = activityLogRepository; }

    @Override public Activity_Log log(Activity_Log entry){ return activityLogRepository.save(entry); }
    @Override public List<Activity_Log> findByActorId(Long actorId){ return activityLogRepository.findByActor_Id(actorId); }
    @Override public Optional<Activity_Log> findById(Long id){ return activityLogRepository.findById(id); }
    @Override public void delete(Long id){ activityLogRepository.deleteById(id); }
}
