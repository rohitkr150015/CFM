package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.PasswordResetToken;
import com.mitmeerut.CFM_Portal.Model.User;
import com.mitmeerut.CFM_Portal.Repository.PasswordResetTokenRepository;
import com.mitmeerut.CFM_Portal.Repository.UserRepository;
import com.mitmeerut.CFM_Portal.Service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public ForgotPasswordController(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Step 1: Request password reset - sends OTP to email
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase());
        if (user == null) {
            // Don't reveal if email exists or not (security)
            return ResponseEntity.ok(Map.of("message", "If this email is registered, you will receive an OTP shortly"));
        }

        // Generate 6-digit OTP
        String otp = generateOTP();

        // Create token with 5 minute expiry
        PasswordResetToken token = new PasswordResetToken(
                user,
                otp,
                LocalDateTime.now().plusMinutes(5));
        tokenRepository.save(token);

        // Send OTP email
        String subject = "CFM Portal - Password Reset OTP";
        String body = String.format(
                "Dear %s,\n\n" +
                        "You have requested to reset your password.\n\n" +
                        "Your OTP code is: %s\n\n" +
                        "This code will expire in 5 minutes.\n\n" +
                        "If you did not request this, please ignore this email.\n\n" +
                        "Best regards,\nCFM Portal Team",
                user.getUsername(), otp);

        try {
            emailService.sendEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your registered email",
                "email", maskEmail(user.getEmail())));
    }

    /**
     * Step 2: Verify OTP
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOTP(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase());
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email"));
        }
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByUserAndOtpAndIsUsedFalse(user, otp);

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
        }

        PasswordResetToken token = tokenOpt.get();
        if (token.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired. Please request a new one"));
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "message", "OTP verified successfully"));
    }

    /**
     * Step 3: Reset password with verified OTP
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email, OTP, and new password are required"));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase());
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email"));
        }
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByUserAndOtpAndIsUsedFalse(user, otp);

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
        }

        PasswordResetToken token = tokenOpt.get();
        if (token.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired"));
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        token.setIsUsed(true);
        tokenRepository.save(token);

        // Send confirmation email
        String subject = "CFM Portal - Password Changed Successfully";
        String body = String.format(
                "Dear %s,\n\n" +
                        "Your password has been successfully changed.\n\n" +
                        "If you did not make this change, please contact support immediately.\n\n" +
                        "Best regards,\nCFM Portal Team",
                user.getUsername());

        try {
            emailService.sendEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send password change confirmation: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please login with your new password"));
    }

    /**
     * Generate 6-digit OTP
     */
    private String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Mask email for display (e.g., k***@gmail.com)
     */
    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1)
            return email;
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
