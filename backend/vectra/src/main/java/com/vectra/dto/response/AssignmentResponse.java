package com.vectra.dto.response;

import com.vectra.enums.AssignmentStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AssignmentResponse {
    private Long assignmentId;
    private MissionResponse mission;
    private DroneResponse drone;
    private AssignmentStatus assignmentStatus;
    private LocalDateTime assignedTime;
}
