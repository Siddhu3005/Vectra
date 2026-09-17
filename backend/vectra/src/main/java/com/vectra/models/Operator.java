package com.vectra.models;

import com.vectra.enums.AvailabilityStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "operators")
@Getter
@Setter
public class Operator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long operatorId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String licenseNumber;

    private String certification;

    @Enumerated(EnumType.STRING)
    private AvailabilityStatus availabilityStatus;

    private int totalMissions;

    private int experienceYears;

    public Operator() {
    }

}
