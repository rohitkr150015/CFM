package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Notification;
import com.mitmeerut.CFM_Portal.Model.RolePermission;
import com.mitmeerut.CFM_Portal.Model.User;
import com.mitmeerut.CFM_Portal.Repository.RolePermissionRepository;
import com.mitmeerut.CFM_Portal.Repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RolePermissionServiceImpl implements RolePermissionService {

    private final RolePermissionRepository rolePermissionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RolePermissionServiceImpl(
            RolePermissionRepository rolePermissionRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            EmailService emailService) {
        this.rolePermissionRepository = rolePermissionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @PostConstruct
    public void initializeDefaultRoles() {
        // Initialize default roles if they don't exist
        createIfNotExists("ADMIN", "[\"all\"]");
        createIfNotExists("HOD", "[\"approve_file\",\"manage_dept\",\"view_reports\"]");
        createIfNotExists("TEACHER", "[\"create_course_file\",\"upload_document\",\"submit_file\"]");
        createIfNotExists("SUBJECTHEAD", "[\"approve_file\",\"view_reports\"]");
    }

    private void createIfNotExists(String roleName, String permissions) {
        if (rolePermissionRepository.findByRoleName(roleName).isEmpty()) {
            RolePermission rp = new RolePermission(roleName, permissions);
            rolePermissionRepository.save(rp);
            System.out.println("✅ Initialized default permissions for role: " + roleName);
        }
    }

    @Override
    public List<RolePermission> getAllRoles() {
        return rolePermissionRepository.findAll();
    }

    @Override
    public Optional<RolePermission> getByRoleName(String roleName) {
        return rolePermissionRepository.findByRoleName(roleName);
    }

    @Override
    public RolePermission updatePermissions(String roleName, String permissions, Long updatedBy) {
        RolePermission rp = rolePermissionRepository.findByRoleName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

        String oldPermissions = rp.getPermissions();
        rp.setPermissions(permissions);
        rp.setUpdatedAt(LocalDateTime.now());
        rp.setUpdatedBy(updatedBy);

        RolePermission saved = rolePermissionRepository.save(rp);

        // Notify all users with this role
        notifyUsersOfPermissionChange(roleName, oldPermissions, permissions);

        return saved;
    }

    private void notifyUsersOfPermissionChange(String roleName, String oldPermissions, String newPermissions) {
        try {
            // Map role name to User.userRole enum
            User.userRole roleEnum = User.userRole.valueOf(roleName);
            List<User> affectedUsers = userRepository.findByRole(roleEnum);

            for (User user : affectedUsers) {
                // Create in-app notification with detailed payload
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setType("PERMISSION_CHANGED");
                // Include detailed change info in payload
                String payload = "{" +
                        "\"roleName\":\"" + roleName + "\"," +
                        "\"message\":\"Your permissions have been updated\"," +
                        "\"oldPermissions\":" + oldPermissions + "," +
                        "\"newPermissions\":" + newPermissions + "" +
                        "}";
                notification.setPayload(payload);
                notification.setIsRead(false);
                notification.setCreatedAt(LocalDateTime.now());
                notificationService.send(notification);

                // Send email notification
                String subject = "CFM Portal - Your Permissions Have Been Updated";
                String body = "Hello " + user.getUsername() + ",\n\n" +
                        "Your permissions for the role '" + roleName + "' have been updated.\n\n" +
                        "If you have any questions, please contact your administrator.\n\n" +
                        "Best regards,\nCFM Portal Team";
                emailService.sendEmail(user.getEmail(), subject, body);
            }

            System.out.println("✅ Sent notifications to " + affectedUsers.size() + " users for role: " + roleName);

        } catch (IllegalArgumentException e) {
            System.err.println("❌ Invalid role name for notification: " + roleName);
        } catch (Exception e) {
            System.err.println("❌ Error sending notifications: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
