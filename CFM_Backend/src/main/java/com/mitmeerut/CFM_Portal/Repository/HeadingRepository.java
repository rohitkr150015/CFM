package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.mitmeerut.CFM_Portal.Model.Heading;

@Repository
public interface HeadingRepository extends JpaRepository<Heading, Long> {

    List<Heading> findByCourseFileIdAndParentHeadingIsNull(Long courseFileId);

    List<Heading> findByParentHeadingId(Long parentId);
}
