package com.mitmeerut.CFM_Portal.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "teacher")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Optional relation with Department (minimal)
    @ManyToOne
    @JoinColumn(name = "department_id")
    @JsonIgnore
    private Department department;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "employee_code", unique = true, length = 100)
    private String employeeCode;

    @Column(length = 100)
    private String designation;

    @Column(name = "email_official", length = 150)
    private String emailOfficial;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    @Column(name = "is_active")
    private Boolean isActive = false;   // signup se false, approval ke baad true

    @Column(name = "joined_on")
    private LocalDate joinedOn;

    @Column(name = "created_at", updatable = false)
    private LocalDate createdAt = LocalDate.now();

    // ------------- GETTERS / SETTERS -------------

    public Long getId() {
        return id;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getEmailOfficial() {
        return emailOfficial;
    }

    public void setEmailOfficial(String emailOfficial) {
        this.emailOfficial = emailOfficial;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public LocalDate getJoinedOn() {
        return joinedOn;
    }

    public void setJoinedOn(LocalDate joinedOn) {
        this.joinedOn = joinedOn;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }
}
