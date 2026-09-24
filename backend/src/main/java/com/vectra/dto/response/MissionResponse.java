package com.vectra.dto.response;

import com.vectra.enums.MissionStatus;
import com.vectra.enums.MissionType;
import com.vectra.enums.Priority;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MissionResponse {
    private Long missionId;
    private MissionType missionType;
    private String pickupLocation;
    private String destination;
    private double packageWeight;
    private double totalDistance;
    private double estimatedBatteryRequired;
    private Priority priority;
    private MissionStatus missionStatus;
    private LocalDateTime createdAt;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
