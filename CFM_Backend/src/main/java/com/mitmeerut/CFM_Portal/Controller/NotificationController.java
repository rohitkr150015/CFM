package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.Notification;
import com.mitmeerut.CFM_Portal.Model.User;
import com.mitmeerut.CFM_Portal.Repository.NotificationRepository;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Get all notifications for the current user
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        List<Notification> notifications = notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());

        List<Map<String, Object>> result = notifications.stream()
                .limit(50) // Limit to latest 50
                .map(this::mapNotification)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        long count = notificationRepository.countByUser_IdAndIsReadFalse(user.getId());

        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark a notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        Optional<Notification> notificationOpt = notificationRepository.findById(id);

        if (notificationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Notification notification = notificationOpt.get();

        // Verify ownership
        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        List<Notification> unread = notificationRepository
                .findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(user.getId());

        for (Notification notification : unread) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }

        return ResponseEntity
                .ok(Map.of("message", "All notifications marked as read", "count", String.valueOf(unread.size())));
    }

    /**
     * Delete a notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        Optional<Notification> notificationOpt = notificationRepository.findById(id);

        if (notificationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Notification notification = notificationOpt.get();

        // Verify ownership
        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }

        notificationRepository.delete(notification);

        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }

    private Map<String, Object> mapNotification(Notification notification) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", notification.getId());
        map.put("type", notification.getType());
        map.put("payload", notification.getPayload());
        map.put("isRead", notification.getIsRead());
        map.put("createdAt", notification.getCreatedAt());
        return map;
    }
}
