package com.vectra.dto.response;

import com.vectra.enums.DroneStatus;
import lombok.Data;

@Data
public class DroneResponse {
    private Long droneId;
    private String droneCode;
    private String serialNumber;
    private String model;
    private double payloadCapacity;
    private double batteryPercentage;
    private double batteryPerKm;
    private double batteryPerKg;
    private double minimumReserve;
    private String currentLocation;
    private int flightCount;
    private DroneStatus status;
}
