package com.mitmeerut.CFM_Portal.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;



@Entity
@Table(name = "heading")
@Data
public class Heading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_file_id")
    private CourseFile courseFile;

    @ManyToOne
    @JoinColumn(name = "parent_heading_id")
    private Heading parentHeading;

    private String title;

    private Integer orderIndex;

    private LocalDateTime createdAt;
}


