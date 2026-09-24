package com.vectra.dto.request;

import com.vectra.enums.MissionType;
import com.vectra.enums.Priority;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MissionRequest {

    @NotNull
    private MissionType missionType;

    @NotBlank
    private String pickupLocation;

    @NotBlank
    private String destination;

    @Positive
    private double packageWeight;

    @PositiveOrZero
    private double currentToPickupDistance;

    @PositiveOrZero
    private double pickupToDestinationDistance;

    @PositiveOrZero
    private double destinationToWarehouseDistance;

    @NotNull
    private Priority priority;
}
