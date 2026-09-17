package com.vectra.models;

import java.time.LocalDateTime;

import com.vectra.enums.DroneStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "drones")
@Getter
@Setter
public class Drone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long droneId;

    @Column(nullable = false, unique = true)
    private String droneCode;

    @Column(nullable = false)
    private String model;

    public Long getDroneId() {
        return droneId;
    }

    public void setDroneId(Long droneId) {
        this.droneId = droneId;
    }

    public String getDroneCode() {
        return droneCode;
    }

    public void setDroneCode(String droneCode) {
        this.droneCode = droneCode;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public double getPayloadCapacity() {
        return payloadCapacity;
    }

    public void setPayloadCapacity(double payloadCapacity) {
        this.payloadCapacity = payloadCapacity;
    }

    public double getBatteryPercentage() {
        return batteryPercentage;
    }

    public void setBatteryPercentage(double batteryPercentage) {
        this.batteryPercentage = batteryPercentage;
    }

    public double getBatteryPerKm() {
        return batteryPerKm;
    }

    public void setBatteryPerKm(double batteryPerKm) {
        this.batteryPerKm = batteryPerKm;
    }

    public double getBatteryPerKg() {
        return batteryPerKg;
    }

    public void setBatteryPerKg(double batteryPerKg) {
        this.batteryPerKg = batteryPerKg;
    }

    public double getMinimumReserve() {
        return minimumReserve;
    }

    public void setMinimumReserve(double minimumReserve) {
        this.minimumReserve = minimumReserve;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public void setCurrentLocation(String currentLocation) {
        this.currentLocation = currentLocation;
    }

    public int getFlightCount() {
        return flightCount;
    }

    public void setFlightCount(int flightCount) {
        this.flightCount = flightCount;
    }

    public DroneStatus getStatus() {
        return status;
    }

    public void setStatus(DroneStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Column(nullable = false)
    private double payloadCapacity;

    @Column(nullable = false)
    private double batteryPercentage;

    @Column(nullable = false)
    private double batteryPerKm;

    @Column(nullable = false)
    private double batteryPerKg;

    @Column(nullable = false)
    private double minimumReserve;

    @Column(nullable = false)
    private String currentLocation;

    @Column(nullable = false)
    private int flightCount;
    @Column(unique = true, nullable = false)
    private String serialNumber;
    @Enumerated(EnumType.STRING)
    private DroneStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
    

    public Drone() {
    }

    
}
