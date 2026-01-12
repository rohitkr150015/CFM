package com.mitmeerut.CFM_Portal.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="Notification")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    private String type;

    @Column(columnDefinition = "json")
    private String payload; // keep JSON as String for JPA

    @Column(name="is_read")
    private Boolean isRead = false;

    @Column(name="created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getPayload() {
		return payload;
	}

	public void setPayload(String payload) {
		this.payload = payload;
	}

	public Boolean getIsRead() {
		return isRead;
	}

	public void setIsRead(Boolean isRead) {
		this.isRead = isRead;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public Notification(Long id, User user, String type, String payload, Boolean isRead, LocalDateTime createdAt) {
		super();
		this.id = id;
		this.user = user;
		this.type = type;
		this.payload = payload;
		this.isRead = isRead;
		this.createdAt = createdAt;
	}

	public Notification() {
		super();
	}

	@Override
	public String toString() {
		return "Notification [id=" + id + ", user=" + user + ", type=" + type + ", payload=" + payload + ", isRead="
				+ isRead + ", createdAt=" + createdAt + "]";
	}

    
}
