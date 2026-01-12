package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.User;
import com.mitmeerut.CFM_Portal.Service.EmailService;
import com.mitmeerut.CFM_Portal.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5000")
// @CrossOrigin(origins = "*")
public class AdminController {

        @Autowired
        private UserService userService;

        @Autowired
        private EmailService emailService;

        @GetMapping("/pending-teachers")
        public ResponseEntity<List<User>> getPendingTeachers() {
                List<User> pending = userService.getPendingTeachers();
                return ResponseEntity.ok(pending);
        }

        @GetMapping("/teachers")
        public ResponseEntity<List<User>> getAllTeachers() {
                return ResponseEntity.ok(userService.getAllTeachers());
        }

        @PostMapping("/approve/{userId}")
        public ResponseEntity<?> approveTeacher(@PathVariable Long userId) {

                User approvedUser = userService.approveUser(userId);

                emailService.sendEmail(
                                approvedUser.getEmail(),
                                "Your Teacher Account Has Been Approved",
                                "Dear " + approvedUser.getUsername() + ",\n\n" +
                                                "Your teacher account has been successfully APPROVED by the Administrator.\n"
                                                +
                                                "You can now log in to your dashboard.\n\n" +
                                                "Login Link: http://localhost:5000/login\n\n" +
                                                "Regards,\nCourse File Management Team");

                return ResponseEntity.ok(
                                Map.of(
                                                "message", "Teacher approved successfully",
                                                "email", approvedUser.getEmail(),
                                                "user", approvedUser));
        }

        @DeleteMapping("/delete/{userId}")
        public ResponseEntity<?> deleteUser(@PathVariable Long userId) {

                userService.deleteUser(userId);

                return ResponseEntity.ok(
                                Map.of(
                                                "message", "User deleted successfully"));
        }

}
