package com.vectra.models;

import java.time.LocalDateTime;

import com.vectra.enums.AssignmentStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "assignments")
@Getter
@Setter
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assignmentId;

    @OneToOne
    @JoinColumn(name = "mission_id")
    private Mission mission;

    @ManyToOne
    @JoinColumn(name = "drone_id")
    private Drone drone;

    @ManyToOne
    @JoinColumn(name = "operator_id")
    private Operator operator;

    @Enumerated(EnumType.STRING)
    private AssignmentStatus assignmentStatus;

    private LocalDateTime assignedTime;

    @PrePersist
    public void onAssign() {
        assignedTime = LocalDateTime.now();
    }

    public Assignment() {
    }

}
