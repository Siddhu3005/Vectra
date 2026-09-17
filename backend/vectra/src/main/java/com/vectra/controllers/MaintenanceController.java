package com.vectra.controllers;

import com.vectra.dto.request.MaintenanceRequest;
import com.vectra.models.Maintenance;
import com.vectra.services.MaintenanceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/maintenance")
public class MaintenanceController {
    private final MaintenanceService maintenance;
    public MaintenanceController(MaintenanceService maintenance) { this.maintenance = maintenance; }
    @GetMapping public List<Maintenance> all() { return maintenance.getAllMaintenance(); }
    @GetMapping("/history/{droneId}") public List<Maintenance> history(@PathVariable Long droneId) { return maintenance.history(droneId); }
    @PostMapping public ResponseEntity<Maintenance> create(@Valid @RequestBody MaintenanceRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(maintenance.create(r));
    }
    @PutMapping("/{id}") public Maintenance update(@PathVariable Long id, @Valid @RequestBody MaintenanceRequest r) { return maintenance.update(id, r); }
    @PostMapping("/{id}/complete") public Maintenance complete(@PathVariable Long id) { return maintenance.complete(id); }
}
