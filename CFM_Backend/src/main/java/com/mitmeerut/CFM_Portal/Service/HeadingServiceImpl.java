package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.CourseFile;
import com.mitmeerut.CFM_Portal.Model.Heading;
import com.mitmeerut.CFM_Portal.Repository.CourseFileRepository;
import com.mitmeerut.CFM_Portal.Repository.HeadingRepository;
import com.mitmeerut.CFM_Portal.Repository.DocumentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class HeadingServiceImpl implements HeadingService {

    private final HeadingRepository headingRepo;
    private final CourseFileRepository courseFileRepo;
    private final DocumentRepository documentRepo;
    private final DocumentService documentService;

    @Autowired
    public HeadingServiceImpl(HeadingRepository headingRepo, CourseFileRepository courseFileRepo,
            DocumentRepository documentRepo, DocumentService documentService) {
        this.headingRepo = headingRepo;
        this.courseFileRepo = courseFileRepo;
        this.documentRepo = documentRepo;
        this.documentService = documentService;
    }

    @Override
    public Heading createHeading(Long courseFileId, Long parentHeadingId, String title, Integer orderIndex) {
        CourseFile courseFile = courseFileRepo.findById(courseFileId)
                .orElseThrow(() -> new RuntimeException("CourseFile not found"));

        Heading heading = new Heading();
        heading.setCourseFile(courseFile);
        heading.setTitle(title);
        heading.setOrderIndex(orderIndex != null ? orderIndex : 1);
        heading.setCreatedAt(LocalDateTime.now());

        if (parentHeadingId != null) {
            Heading parent = headingRepo.findById(parentHeadingId)
                    .orElseThrow(() -> new RuntimeException("Parent heading not found"));
            heading.setParentHeading(parent);
        }

        return headingRepo.save(heading);
    }

    @Override
    public Heading updateHeading(Long id, String title) {
        Heading heading = headingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Heading not found"));
        heading.setTitle(title);
        return headingRepo.save(heading);
    }

    @Override
    public void deleteHeading(Long id) {
        Heading heading = headingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Heading not found"));

        // Delete all child headings recursively
        deleteChildrenRecursively(id);

        // Delete documents for this heading
        deleteDocumentsForHeading(id);

        // Delete the heading itself
        headingRepo.delete(heading);
    }

    private void deleteChildrenRecursively(Long parentId) {
        List<Heading> children = headingRepo.findByParentHeadingId(parentId);
        for (Heading child : children) {
            deleteChildrenRecursively(child.getId());
            deleteDocumentsForHeading(child.getId());
            headingRepo.delete(child);
        }
    }

    private void deleteDocumentsForHeading(Long headingId) {
        // Fetch and delete all documents attached to this heading
        List<com.mitmeerut.CFM_Portal.Model.Document> documents = documentRepo.findByHeading_Id(headingId);
        for (com.mitmeerut.CFM_Portal.Model.Document doc : documents) {
            documentService.deleteDocument(doc.getId());
        }
    }

    @Override
    public List<Heading> getHeadingsByCourseFile(Long courseFileId) {
        return headingRepo.findByCourseFileIdAndParentHeadingIsNull(courseFileId);
    }

    @Override
    public List<Heading> getChildHeadings(Long parentId) {
        return headingRepo.findByParentHeadingId(parentId);
    }
}