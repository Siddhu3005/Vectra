package com.vectra.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DroneRequest {

    @NotBlank private String droneCode;

    @NotBlank private String serialNumber;

    @NotBlank private String model;

    @Positive private double payloadCapacity;

    @DecimalMin("0.0") @DecimalMax("100.0") private double batteryPercentage;

    @PositiveOrZero private double batteryPerKm;

    @PositiveOrZero private double batteryPerKg;

    @DecimalMin("0.0") @DecimalMax("100.0") private double minimumReserve;

    @NotBlank private String currentLocation;

}
