package com.mitmeerut.CFM_Portal.security.user;

import com.mitmeerut.CFM_Portal.Model.Teacher;
import com.mitmeerut.CFM_Portal.Model.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    public Long getUserId() {
        return user.getId();
    }

    public User.userRole getRole() {
        return user.getRole();
    }

    public Teacher getTeacher() {
        return user.getTeacher();
    }

    public Long getDepartmentId() {
        if (user.getTeacher() == null || user.getTeacher().getDepartment() == null) {
            return null;
        }
        return user.getTeacher().getDepartment().getId();
    }

    @Override
    public List<SimpleGrantedAuthority> getAuthorities() {
        return List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
    }

    @Override public String getPassword() { return user.getPasswordHash(); }
    @Override public String getUsername() { return user.getEmail(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return Boolean.TRUE.equals(user.getIsActive()); }
}
