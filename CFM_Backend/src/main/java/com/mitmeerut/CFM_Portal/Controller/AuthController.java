package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Model.User;
import com.mitmeerut.CFM_Portal.Service.UserService;
import com.mitmeerut.CFM_Portal.security.jwt.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://localhost:5000",
        allowCredentials = "false"
)
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // ---------------- REGISTER ----------------

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {

        String name = req.get("name");
        String email = req.get("email");
        String password = req.get("password");

        User user = userService.registerTeacherUser(name, email, password);

        return ResponseEntity.ok(Map.of(
                "message", "Registration submitted. Wait for admin approval.",
                "id", user.getId(),
                "email", user.getEmail()
        ));
    }

    // ---------------- LOGIN ----------------

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {

        String email = req.get("email");
        String password = req.get("password");

        boolean ok = userService.login(email, password);
        if (!ok) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("message", "Invalid credentials or not approved yet"));
        }

        String token = jwtTokenProvider.generateToken(email);

        User user = userService.findByEmail(email);

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "token", token,
                "tokenType", "Bearer",
                "role", user.getRole().name(),
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "isActive", user.getIsActive()
        ));
    }
}
