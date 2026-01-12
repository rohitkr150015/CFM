package com.mitmeerut.CFM_Portal.Service;
import com.mitmeerut.CFM_Portal.Model.Heading;
import com.mitmeerut.CFM_Portal.Model.User;
import com.mitmeerut.CFM_Portal.Repository.HeadingRepository;
import com.mitmeerut.CFM_Portal.dto.HeadingTreeDto;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;


@Service
@Transactional
public class HeadingServiceImpl implements HeadingService{
    private HeadingRepository headingRepo;
    public HeadingServiceImpl(HeadingRepository headingRepo) {
        this.headingRepo = headingRepo;
    }
    @Override
    public Heading addSubHeading(Long parentHeadingId, String title, CustomUserDetails user) {

        if (user.getRole() != User.userRole.TEACHER) {
            throw new RuntimeException("Only teacher can add heading");
        }

        Heading parent = headingRepo.findById(parentHeadingId)
                .orElseThrow(() -> new RuntimeException("Parent heading not found"));

        Heading heading = new Heading();
        heading.setCourseFile(parent.getCourseFile());
        heading.setParentHeading(parent);
        heading.setTitle(title);
        heading.setCreatedAt(LocalDateTime.now());

        return headingRepo.save(heading);
    }

    @Override
    public List<Heading> getRootHeadings(Long courseFileId){
        return headingRepo.findByCourseFileIdAndParentHeadingIsNull(courseFileId);
    }

    @Override
    public List<Heading> getChildHeadings(Long parentHeadingId){
        return headingRepo.findByParentHeadingId(parentHeadingId);
    }

    @Override
    public List<HeadingTreeDto> getHeadingTree(Long courseFileId) {

        List<Heading> roots =
                headingRepo.findByCourseFileIdAndParentHeadingIsNull(courseFileId);

        return roots.stream()
                .map(this::buildTree)
                .toList();
    }

    private HeadingTreeDto buildTree(Heading heading) {

        HeadingTreeDto dto =
                new HeadingTreeDto(heading.getId(), heading.getTitle());

        List<Heading> children =
                headingRepo.findByParentHeadingId(heading.getId());

        for (Heading child : children) {
            dto.getChildren().add(buildTree(child));
        }

        return dto;
    }

}