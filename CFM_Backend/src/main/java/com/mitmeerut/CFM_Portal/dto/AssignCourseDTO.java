package com.mitmeerut.CFM_Portal.dto;

import lombok.Data;

@Data
public class AssignCourseDTO {
    private Long courseId;
    private Long teacherId;
    private String section;
    private String academicYear;

}
