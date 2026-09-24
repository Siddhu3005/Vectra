package com.vectra.controllers;

import com.vectra.dto.response.DashboardResponse;
import com.vectra.services.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboard;
    public DashboardController(DashboardService dashboard) { this.dashboard = dashboard; }
    @GetMapping public DashboardResponse get() { return dashboard.getDashboard(); }
}
