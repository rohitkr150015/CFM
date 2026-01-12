package com.mitmeerut.CFM_Portal.Controller;

import com.mitmeerut.CFM_Portal.dto.HeadingTreeDto;
import com.mitmeerut.CFM_Portal.security.user.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.mitmeerut.CFM_Portal.Model.Heading;
import com.mitmeerut.CFM_Portal.Service.HeadingService;
import com.mitmeerut.CFM_Portal.Service.HeadingServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/heading")
public class HeadingController{
    private HeadingService headingService;
    public HeadingController(HeadingService headingService){
        this.headingService = headingService;
    }

    @PostMapping("/{parentId}")
    public Heading addSubHeading(@PathVariable Long parentId, @RequestParam String title,@AuthenticationPrincipal CustomUserDetails user){
    return headingService.addSubHeading(parentId,title,user);
    }

    @GetMapping("/root/{courseFileId}")
    public List<Heading> getChild(@PathVariable Long parentId){
    return headingService.getChildHeadings(parentId);
    }
    @GetMapping("/tree/{courseFileId}")
    public List<HeadingTreeDto> getTree(@PathVariable("courseFileId") Long courseFileId) {
        return headingService.getHeadingTree(courseFileId);
    }

    @GetMapping("/test")
    public String test() {
        return "OK";
    }


}