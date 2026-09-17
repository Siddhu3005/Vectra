package com.vectra.dto.response;

import com.vectra.models.Assignment;
import com.vectra.models.Drone;
import com.vectra.models.Maintenance;
import com.vectra.models.Mission;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DroneHistoryResponse {
    private Drone drone;
    private List<Assignment> assignments;
    private List<Mission> missions;
    private List<Maintenance> maintenance;
    private int flightCount;
    private double batteryPercentage;
}
