package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Heading;
import com.mitmeerut.CFM_Portal.dto.HeadingTreeDto;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;

import java.util.List;
import java.util.Optional;

public interface HeadingService {
    Heading addSubHeading(Long parentHeadingId, String title, CustomUserDetails user);
    List<Heading>getRootHeadings(Long courseFileId);
    List<Heading>getChildHeadings(Long parentHeadingId);
    List<HeadingTreeDto> getHeadingTree(Long courseFileId);


}
