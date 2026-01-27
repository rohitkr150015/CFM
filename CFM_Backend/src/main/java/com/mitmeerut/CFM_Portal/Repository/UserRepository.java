package com.mitmeerut.CFM_Portal.Repository;

import com.mitmeerut.CFM_Portal.Model.Teacher;
import com.mitmeerut.CFM_Portal.Model.User;
import com.mitmeerut.CFM_Portal.Model.User.userRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    User findByEmail(String email);

    List<User> findByRoleAndIsActive(userRole role, Boolean isActive);

    // User findByTeacher(Teacher teacher);

    List<User> findByIsActiveTrue();

    List<User> findByRole(User.userRole role);

    Optional<User> findByTeacher(Teacher teacher);

    Optional<User> findByTeacher_Id(Long teacherId);

}
