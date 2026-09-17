package com.vectra.models;

import java.time.LocalDate;

import com.vectra.enums.MaintenanceStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "maintenance")
@Getter
@Setter
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maintenanceId;

    @ManyToOne
    @JoinColumn(name = "drone_id")
    private Drone drone;

    private String issue;

    private String maintenanceType;

    @Enumerated(EnumType.STRING)
    private MaintenanceStatus status;

    private String remarks;

    private LocalDate startDate;

    private LocalDate completedDate;

    public Maintenance() {
    }

}
