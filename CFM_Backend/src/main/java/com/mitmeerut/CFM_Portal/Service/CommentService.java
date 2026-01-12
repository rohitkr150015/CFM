package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Comment;
import java.util.List;
import java.util.Optional;

public interface CommentService {
    List<Comment> findByHeadingId(Long headingId);
    List<Comment> findByCourseFileId(Long courseFileId);
    Comment save(Comment comment);
    Optional<Comment> findById(Long id);
    void delete(Long id);
}
