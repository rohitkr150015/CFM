package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.Service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SystemSettingController {

    @Autowired
    private SystemSettingService systemSettingService;

    @GetMapping("/public/settings")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        return ResponseEntity.ok(systemSettingService.getAllSettings());
    }

    @PostMapping("/admin/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> settings) {
        systemSettingService.updateSettings(settings);
        return ResponseEntity.ok(Map.of("message", "Settings updated successfully"));
    }
}
