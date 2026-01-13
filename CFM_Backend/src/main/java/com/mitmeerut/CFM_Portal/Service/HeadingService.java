package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Heading;
import java.util.List;

public interface HeadingService {

    Heading createHeading(Long courseFileId, Long parentHeadingId, String title, Integer orderIndex);

    Heading updateHeading(Long id, String title);

    void deleteHeading(Long id);

    List<Heading> getHeadingsByCourseFile(Long courseFileId);

    List<Heading> getChildHeadings(Long parentId);
}
