package com.mitmeerut.CFM_Portal.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Document")
public class Document {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne 
    @JoinColumn(name = "heading_id")
    private Heading heading;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private Teacher uploadedBy;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;

    private String type;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "version_no")
    private Integer versionNo;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public Document(){}

    // getters & setters
    public Long getId(){ return id; }
    public void setId(Long id){ this.id = id; }
    public Heading getHeading(){ return heading; }
    public void setHeading(Heading heading){ this.heading = heading; }
    public Teacher getUploadedBy(){ return uploadedBy; }
    public void setUploadedBy(Teacher uploadedBy){ this.uploadedBy = uploadedBy; }
    public String getFileName(){ return fileName; }
    public void setFileName(String fileName){ this.fileName = fileName; }
    public String getFilePath(){ return filePath; }
    public void setFilePath(String filePath){ this.filePath = filePath; }
    public String getType(){ return type; }
    public void setType(String type){ this.type = type; }
    public Long getFileSize(){ return fileSize; }
    public void setFileSize(Long fileSize){ this.fileSize = fileSize; }
    public Integer getVersionNo(){ return versionNo; }
    public void setVersionNo(Integer versionNo){ this.versionNo = versionNo; }
    public LocalDateTime getUploadedAt(){ return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt){ this.uploadedAt = uploadedAt; }
}
