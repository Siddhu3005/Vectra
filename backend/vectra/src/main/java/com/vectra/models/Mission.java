package com.vectra.models;

import java.time.LocalDateTime;

import com.vectra.enums.MissionStatus;
import com.vectra.enums.MissionType;
import com.vectra.enums.Priority;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "missions")
@Getter
@Setter
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long missionId;

    @Enumerated(EnumType.STRING)
    private MissionType missionType;

    private String pickupLocation;

    private String destination;

    private double packageWeight;

    @Column(nullable = false)
private double currentToPickupDistance;

@Column(nullable = false)
private double pickupToDestinationDistance;

@Column(nullable = false)
private double destinationToWarehouseDistance;

@Column(nullable = false)
private double estimatedBatteryRequired;

@Transient
public double getTotalDistance() {
    return currentToPickupDistance
            + pickupToDestinationDistance
            + destinationToWarehouseDistance;
}

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private MissionStatus missionStatus;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
