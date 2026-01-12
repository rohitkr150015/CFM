package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.CourseFile;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;

import java.util.List;
import java.util.Optional;

public interface CourseFileService {

    CourseFile createCourseFile(Long courseId, CustomUserDetails user);

}
