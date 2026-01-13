package com.mitmeerut.CFM_Portal.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_file")
@Data
public class CourseFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private String academicYear;

    private String section;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private Teacher createdBy;

    private String status;

    private LocalDateTime createdAt;

}
