package com.mitmeerut.CFM_Portal.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "Course_Teacher")
public class CourseTeacher {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne 
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    private String section;

    @Column(name = "academic_year")
    private String academicYear;

    public CourseTeacher(){}

    // getters & setters
    public Long getId(){ return id; }
    public void setId(Long id){ this.id = id; }
    public Course getCourse(){ return course; }
    public void setCourse(Course course){ this.course = course; }
    public Teacher getTeacher(){ return teacher; }
    public void setTeacher(Teacher teacher){ this.teacher = teacher; }
    public String getSection(){ return section; }
    public void setSection(String section){ this.section = section; }
    public String getAcademicYear(){ return academicYear; }
    public void setAcademicYear(String academicYear){ this.academicYear = academicYear; }
}
