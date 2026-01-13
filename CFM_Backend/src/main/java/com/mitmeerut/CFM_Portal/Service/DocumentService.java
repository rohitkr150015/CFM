package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Document;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface DocumentService {

    Document uploadDocument(Long headingId, MultipartFile file, Long teacherId, String courseCode);

    void deleteDocument(Long id);

    List<Document> getDocumentsByHeading(Long headingId);

    Document getDocumentById(Long id);
}
