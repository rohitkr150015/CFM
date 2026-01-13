package com.mitmeerut.CFM_Portal.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mitmeerut.CFM_Portal.Model.*;
import com.mitmeerut.CFM_Portal.Repository.CourseFileRepository;
import com.mitmeerut.CFM_Portal.Repository.HeadingRepository;
import com.mitmeerut.CFM_Portal.Repository.CourseRepository;
import com.mitmeerut.CFM_Portal.Repository.TemplateRepository;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CourseFileServiceImpl implements CourseFileService {
    private CourseFileRepository CourseFileRepo;
    private HeadingRepository headingRepo;
    private CourseRepository courseRepo;
    private TemplateRepository templateRepo;
    private ObjectMapper mapper = new ObjectMapper();
    private final HeadingService headingService;

    @Autowired
    public CourseFileServiceImpl(CourseFileRepository courseFileRepo, HeadingRepository headingRepo,
            CourseRepository courseRepo, TemplateRepository templateRepo, HeadingService headingService) {
        this.CourseFileRepo = courseFileRepo;
        this.headingRepo = headingRepo;
        this.courseRepo = courseRepo;
        this.templateRepo = templateRepo;
        this.headingService = headingService;
    }

    @Override
    public CourseFile createCourseFile(com.mitmeerut.CFM_Portal.dto.CreateCourseFileRequest request,
            CustomUserDetails user) {
        if (user.getRole() != User.userRole.TEACHER) {
            throw new RuntimeException("only teacher can create course file");
        }
        Teacher teacher = user.getTeacher();
        if (teacher == null || teacher.getDepartment() == null) {
            throw new RuntimeException("Teacher or Department missing");
        }
        Course course = courseRepo.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("course not found"));

        Template template = templateRepo.findById(request.getTemplateId())
                .orElseThrow(() -> new RuntimeException("Template not found"));

        CourseFile courseFile = new CourseFile();
        courseFile.setCourse(course);
        courseFile.setCreatedBy(teacher);
        courseFile.setAcademicYear(request.getAcademicYear());
        courseFile.setSection(request.getSection());
        courseFile.setStatus("DRAFT");
        courseFile.setCreatedAt(LocalDateTime.now());
        courseFile = CourseFileRepo.save(courseFile);

        createRootHeadings(courseFile, template);
        return courseFile;
    }

    public void createRootHeadings(CourseFile courseFile, Template template) {
        try {
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(template.getStructure());
            com.fasterxml.jackson.databind.JsonNode headings = root.get("headings");

            if (headings != null && headings.isArray()) {
                int order = 1;
                for (com.fasterxml.jackson.databind.JsonNode node : headings) {
                    String title = node.get("title").asText();

                    Heading heading = new Heading();
                    heading.setCourseFile(courseFile);
                    heading.setTitle(title);
                    heading.setParentHeading(null);
                    heading.setOrderIndex(order++);
                    heading.setCreatedAt(LocalDateTime.now());
                    headingRepo.save(heading);
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing template structure: " + e.getMessage());
            // Don't fail the whole creation, just log? Or throw?
            // throw new RuntimeException("Invalid template structure JSON");
            // For now let's just create the file without headings to avoid total blockage
            // if parsing fails
        }
    }

    @Override
    public java.util.List<CourseFile> getCourseFilesByTeacher(Long teacherId) {
        return CourseFileRepo.findByCreatedById(teacherId);
    }

    @Override
    public void deleteCourseFile(Long id) {
        CourseFile courseFile = CourseFileRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Course File not found"));

        // Fetch root headings (headings directly under this course file)
        List<Heading> rootHeadings = headingRepo.findByCourseFileIdAndParentHeadingIsNull(courseFile.getId());

        // Delete each root heading using HeadingService (which cascades to children and
        // documents)
        for (Heading heading : rootHeadings) {
            headingService.deleteHeading(heading.getId());
        }

        // Delete the course file record
        CourseFileRepo.delete(courseFile);
    }
}
