package com.mitmeerut.CFM_Portal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.mitmeerut.CFM_Portal.Model.Document;
import com.mitmeerut.CFM_Portal.Model.Heading;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
//	 List<Document> findByHeading(Heading heading);

	List<Document> findByHeading_Id(Long headingId);

  boolean existsByHeading(Heading heading);
}
