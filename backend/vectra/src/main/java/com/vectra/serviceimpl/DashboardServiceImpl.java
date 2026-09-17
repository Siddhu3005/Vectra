package com.vectra.serviceimpl;

import com.vectra.dto.response.DashboardResponse;
import com.vectra.enums.*;
import com.vectra.repos.*;
import com.vectra.services.DashboardService;
import java.time.*;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {
    private final DroneRepository drones;
    private final OperatorRepository operators;
    private final MissionRepository missions;
    public DashboardServiceImpl(DroneRepository drones, OperatorRepository operators, MissionRepository missions) {
        this.drones = drones; this.operators = operators; this.missions = missions;
    }
    @Override public DashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        return new DashboardResponse(drones.count(), drones.countByStatus(DroneStatus.AVAILABLE),
                drones.countByStatus(DroneStatus.CHARGING), drones.countByStatus(DroneStatus.MAINTENANCE),
                drones.countByStatus(DroneStatus.OFFLINE), operators.count(),
                missions.countByCreatedAtBetween(today.atStartOfDay(), today.plusDays(1).atStartOfDay()),
                missions.countByMissionStatus(MissionStatus.PENDING),
                missions.countByMissionStatus(MissionStatus.COMPLETED));
    }
}
