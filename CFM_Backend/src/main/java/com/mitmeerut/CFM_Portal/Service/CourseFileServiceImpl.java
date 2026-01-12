package com.mitmeerut.CFM_Portal.Service;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mitmeerut.CFM_Portal.Model.*;
import com.mitmeerut.CFM_Portal.Repository.CourseFileRepository;
import com.mitmeerut.CFM_Portal.Repository.HeadingRepository;
import com.mitmeerut.CFM_Portal.Repository.CourseRepository;
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
    private TemplateService templateService;
    private ObjectMapper mapper=new ObjectMapper();
    @Autowired
    public CourseFileServiceImpl(CourseFileRepository courseFileRepo, HeadingRepository headingRepo, CourseRepository courseRepo, TemplateService templateService) {
        this.CourseFileRepo = courseFileRepo;
        this.headingRepo = headingRepo;
        this.courseRepo = courseRepo;
        this.templateService = templateService;

    }

    @Override
    public CourseFile createCourseFile(Long courseId, CustomUserDetails user) {
        if(user.getRole()!= User.userRole.TEACHER){
            throw new RuntimeException("only teacher can create course file");
        }
        Teacher teacher=user.getTeacher();
        if(teacher==null||teacher.getDepartment()==null){
            throw new RuntimeException("Teacher or Department missing");
        }
        Course course=courseRepo.findById(courseId).orElseThrow(()->new RuntimeException("course  not found"));
        CourseFile courseFile=new CourseFile();
        courseFile.setCourse(course);
        courseFile.setCreatedBy(teacher);
        courseFile.setAcademicYear("2025-2026");
        courseFile.setStatus("DRAFT");
        courseFile.setCreatedAt(LocalDateTime.now());
        courseFile=CourseFileRepo.save(courseFile);


        Template template=templateService.getDepartmentTemplate(teacher.getDepartment().getId());
        createRootHeadings(courseFile,template);
        return courseFile;
    }

    public void createRootHeadings(CourseFile courseFile, Template template) {
        try{
            List<String> titles=mapper.readValue(template.getStructure(), new TypeReference<List<String>>() {
            });
            int order=1;
            for(String title:titles){
                Heading heading=new Heading();
                heading.setCourseFile(courseFile);
                heading.setTitle(title);
                heading.setParentHeading(null);
                heading.setOrderIndex(order++);
                heading.setCreatedAt(LocalDateTime.now());
                headingRepo.save(heading);
            }
        }
        catch(Exception e){
            throw new RuntimeException("Invalid template structure JSON");
        }
    }



}
