package com.vectra.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardResponse {
    private long totalDrones;
    private long available;
    private long charging;
    private long maintenance;
    private long offline;
    private long operators;
    private long todaysMissions;
    private long pendingMissions;
    private long completedMissions;
}
