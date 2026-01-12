package com.mitmeerut.CFM_Portal.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Getter
@Setter

// matches your SQL table name
public class User {

    public enum userRole {
        ADMIN, TEACHER, HOD, SUBJECTHEAD
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50)
    private userRole role;

    @OneToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "is_active")
    private Boolean isActive = false;   // default: inactive (needs approval)

    @Column(name = "last_login")
    private LocalDateTime lastLogin = LocalDateTime.now();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ---------------- GETTERS / SETTERS ----------------

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setRole(userRole role) {
        this.role = role;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

}
