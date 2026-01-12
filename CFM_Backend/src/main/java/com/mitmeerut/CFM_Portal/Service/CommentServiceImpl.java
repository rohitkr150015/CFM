package com.mitmeerut.CFM_Portal.Service;

import com.mitmeerut.CFM_Portal.Model.Comment;
import com.mitmeerut.CFM_Portal.Repository.CommentRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    public CommentServiceImpl(CommentRepository commentRepository){ this.commentRepository = commentRepository; }

    @Override public List<Comment> findByHeadingId(Long headingId){ return commentRepository.findByHeading_Id(headingId); }
    @Override public List<Comment> findByCourseFileId(Long courseFileId){ return commentRepository.findByCourseFile_Id(courseFileId); }
    @Override public Comment save(Comment comment){ return commentRepository.save(comment); }
    @Override public Optional<Comment> findById(Long id){ return commentRepository.findById(id); }
    @Override public void delete(Long id){ commentRepository.deleteById(id); }
}
