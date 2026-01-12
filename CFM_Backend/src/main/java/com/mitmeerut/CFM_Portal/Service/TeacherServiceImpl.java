
package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Department;
import com.mitmeerut.CFM_Portal.Model.Teacher;
import com.mitmeerut.CFM_Portal.Model.User;
import com.mitmeerut.CFM_Portal.Repository.DepartmentRepository;
import com.mitmeerut.CFM_Portal.Repository.TeacherRepository;
import com.mitmeerut.CFM_Portal.Repository.UserRepository;
import com.mitmeerut.CFM_Portal.dto.FacultyResponse;
import com.mitmeerut.CFM_Portal.dto.FacultyUpdateRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TeacherServiceImpl implements TeacherService {

    private  TeacherRepository teacherRepo;
    @Autowired
    private  UserRepository userRepo;
    @Autowired
    private  DepartmentRepository deptRepo;
    
    @Autowired
    public TeacherServiceImpl(TeacherRepository teacherRepository) {
        this.teacherRepo = teacherRepository;
    }


    public Teacher getTeacherByUserId(Long userId) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Teacher teacher = user.getTeacher();

        if (teacher == null) {
            throw new RuntimeException("Teacher not linked with this user");
        }

        return teacher;
    }

    public User updateUserAndTeacher(Long userId, FacultyUpdateRequest dto) {
        
      
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2) Teacher fetch (linked with user)
        Teacher teacher = user.getTeacher();
        if (teacher == null) {
            throw new RuntimeException("Teacher not linked with this user");
        }

        // 3) Update User fields
        user.setEmail(dto.getEmail());
        user.setRole(User.userRole.valueOf(dto.getRole()));

        // 4) Update Teacher fields
        teacher.setName(dto.getName());
        teacher.setDesignation(dto.getDesignation());
        teacher.setContactNumber(dto.getContactNumber());
        
        if (dto.getDepartmentId() != null) {
            Department dept = deptRepo.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            teacher.setDepartment(dept);
        }

        // 5) Save both
        teacherRepo.save(teacher);
        return userRepo.save(user);
    }
    
//    public User updateUserAndTeacher(Long userId, FacultyUpdateRequest dto, boolean force) {
//
//        User user = userRepo.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        Teacher teacher = user.getTeacher();
//        if (teacher == null) {
//            throw new RuntimeException("Teacher not linked with this user");
//        }
//
//        // -----------------------------
//        // HOD CONFLICT CHECK
//        // -----------------------------
//        if (dto.getRole().equals("HOD") && dto.getDepartmentId() != null) {
//
//            Department alreadyHodDept = deptRepo.findByHodId(userId).orElse(null);
//
//            if (alreadyHodDept != null) {
//
//                if (!force) {
//                    throw new RuntimeException(
//                            "This teacher is already HOD of " +
//                            alreadyHodDept.getName() +
//                            ". Do you want to assign HOD to another department also?"
//                    );
//                }
//            }
//        }
//
//        // -----------------------------
//        // IF ROLE DOWNGRADED (Remove HOD)
//        // -----------------------------
//        if (!dto.getRole().equals("HOD")) {
//
//            Department hodOfDept = deptRepo.findByHodId(userId).orElse(null);
//
//            if (hodOfDept != null) {
//
//                if (!force) {
//                    throw new RuntimeException(
//                            "This teacher is currently HOD of " +
//                            hodOfDept.getName() +
//                            ". Do you want to remove HOD role?"
//                    );
//                }
//
//                hodOfDept.setHodId(null);
//                deptRepo.save(hodOfDept);
//            }
//        }

//        // -----------------------------
//        // UPDATE USER
//        // -----------------------------
//        user.setEmail(dto.getEmail());
//        user.setRole(User.userRole.valueOf(dto.getRole()));
//
//        // -----------------------------
//        // UPDATE TEACHER
//        // -----------------------------
//        teacher.setName(dto.getName());
//        teacher.setDesignation(dto.getDesignation());
//        teacher.setContactNumber(dto.getContactNumber());
//
//        if (dto.getDepartmentId() != null) {
//            Department dept = deptRepo.findById(dto.getDepartmentId())
//                    .orElseThrow(() -> new RuntimeException("Department not found"));
//
//            teacher.setDepartment(dept);
//
//            // If role = HOD, assign
//            if (dto.getRole().equals("HOD")) {
//                dept.setHodId(userId);
//                deptRepo.save(dept);
//            }
//        }
//
//        teacherRepo.save(teacher);
//        return userRepo.save(user);
//    }
//
//    
    @Override
    public void deleteUserAndTeacher(Long userId) {

        // 1) Fetch user
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2) Fetch linked teacher
        Teacher teacher = user.getTeacher();

        // 3) Unlink teacher from user
        if (teacher != null) {
            user.setTeacher(null);
            userRepo.save(user);
            teacherRepo.delete(teacher);   // delete teacher record
        }

        // 4) Delete user
        userRepo.delete(user);
    }


    
    
    @Override
    public List<FacultyResponse> getFacultyList() {

        List<User> users = userRepo.findByIsActiveTrue();  // Only ACTIVE ✔

        List<FacultyResponse> list = new ArrayList<>();

        for (User u : users) {
            if (u.getTeacher() == null) continue;

            Teacher t = u.getTeacher();

            FacultyResponse dto = new FacultyResponse();

            dto.setId(u.getId());
            dto.setUsername(u.getUsername());
            dto.setEmail(u.getEmail());
            dto.setRole(u.getRole().name());
            dto.setIsActive(u.getIsActive());
            dto.setCreatedAt(u.getCreatedAt() != null ?
                    u.getCreatedAt().toString() : "");

            dto.setTeacherId(t.getId());
            dto.setName(t.getName());
            dto.setDesignation(t.getDesignation());
            dto.setDepartmentId(
                    t.getDepartment() != null ? t.getDepartment().getId() : null
            );
            dto.setDepartmentName(
                    t.getDepartment() != null ? t.getDepartment().getName() : null
            );
            dto.setContactNumber(t.getContactNumber());

            list.add(dto);
        }

        return list;
    }

    
    @Override
    public List<Teacher> getHodList() {

        List<User> hodUsers = userRepo.findByRole(User.userRole.HOD);

        List<Teacher> list = new ArrayList<>();

        for (User u : hodUsers) {
            if (u.getTeacher() != null) {
                list.add(u.getTeacher());
            }
        }

        return list;
    }


}
