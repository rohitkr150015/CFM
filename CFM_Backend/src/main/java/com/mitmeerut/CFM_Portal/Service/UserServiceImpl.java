package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Teacher;
import com.mitmeerut.CFM_Portal.Model.User;
import com.mitmeerut.CFM_Portal.Model.User.userRole;
import com.mitmeerut.CFM_Portal.Repository.TeacherRepository;
import com.mitmeerut.CFM_Portal.Repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private TeacherRepository teacherRepo;
    @Autowired
    private EmailService emailService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    public User registerTeacherUser(String name, String email, String password) {

        if (userRepo.existsByEmail(email))
            throw new RuntimeException("Email already registered!");

        if (userRepo.existsByUsername(name))
            throw new RuntimeException("Username already exists!");

        User user = new User();
        user.setUsername(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(userRole.TEACHER);
        user.setIsActive(false);

        User savedUser = userRepo.save(user);

        Teacher t = new Teacher();
        t.setName(name);
        t.setEmailOfficial(email);
        t.setIsActive(false);

        teacherRepo.save(t);

        savedUser.setTeacher(t);
        userRepo.save(savedUser);

        String approveLink = baseUrl + "/api/admin/approve/" + savedUser.getId();
        emailService.sendEmail(
                adminEmail,
                "New Teacher Registration",
                "A new teacher registered.\n\nName: " + name +
                        "\nEmail: " + email +
                        "\nApprove: " + approveLink);

        return savedUser;
    }

    @Override
    public Boolean login(String email, String password) {

        User user = userRepo.findByEmail(email);
        if (user == null)
            return false;

        if (!Boolean.TRUE.equals(user.getIsActive()))
            return false;

        // return user.getPasswordHash().equals(password);
        return passwordEncoder.matches(password, user.getPasswordHash());
    }

    @Override
    public List<User> getPendingTeachers() {
        return userRepo.findByRoleAndIsActive(userRole.TEACHER, false);
    }

    @Override
    public List<User> getAllTeachers() {
        return userRepo.findByRole(userRole.TEACHER);
    }

    @Override
    public User approveUser(Long userId) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(true);
        userRepo.save(user);

        if (user.getTeacher() != null) {
            Teacher t = user.getTeacher();
            t.setIsActive(true);
            teacherRepo.save(t);
        }

        return user;
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTeacher() != null)
            teacherRepo.delete(user.getTeacher());

        userRepo.delete(user);
    }

    @Override
    public User findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    @Override
    public User findById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}
