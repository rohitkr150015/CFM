package com.mitmeerut.CFM_Portal.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Approval")
public class Approval {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_file_id")
    private CourseFile courseFile;

    @ManyToOne 
    @JoinColumn(name = "approver_id")
    private Teacher approver;

    private String stage;
    private String status;

    @Lob
    private String comment;

    @Column(name = "acted_at")
    private LocalDateTime actedAt = LocalDateTime.now();

    public Approval(){}

    // getters & setters
    public Long getId(){ return id; }
    public void setId(Long id){ this.id = id; }
    public CourseFile getCourseFile(){ return courseFile; }
    public void setCourseFile(CourseFile courseFile){ this.courseFile = courseFile; }
    public Teacher getApprover(){ return approver; }
    public void setApprover(Teacher approver){ this.approver = approver; }
    public String getStage(){ return stage; }
    public void setStage(String stage){ this.stage = stage; }
    public String getStatus(){ return status; }
    public void setStatus(String status){ this.status = status; }
    public String getComment(){ return comment; }
    public void setComment(String comment){ this.comment = comment; }
    public LocalDateTime getActedAt(){ return actedAt; }
    public void setActedAt(LocalDateTime actedAt){ this.actedAt = actedAt; }
}
