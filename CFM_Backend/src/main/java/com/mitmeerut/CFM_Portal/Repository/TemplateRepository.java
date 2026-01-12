package com.mitmeerut.CFM_Portal.Repository;

import com.mitmeerut.CFM_Portal.Model.Template;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TemplateRepository extends JpaRepository<Template, Long> {

    List<Template> findByDepartmentId(Long departmentId);


    Optional<Template> findFirstByDepartmentId(Long departmentId);
}
