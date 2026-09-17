package com.vectra.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vectra.dto.request.DroneRequest;
import com.vectra.models.Drone;
import com.vectra.services.DroneService;
import com.vectra.dto.response.DroneHistoryResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/drones")
@CrossOrigin(origins = "*")
public class DroneController {

    private final DroneService droneService;

    public DroneController(DroneService droneService) {
        this.droneService = droneService;
    }

    @PostMapping
    public ResponseEntity<Drone> createDrone(@Valid @RequestBody DroneRequest request) {

        Drone drone = droneService.createDrone(request);

        return new ResponseEntity<>(drone, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Drone>> getAllDrones() {

        return ResponseEntity.ok(droneService.getAllDrones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Drone> getDroneById(@PathVariable Long id) {

        return ResponseEntity.ok(droneService.getDroneById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Drone> updateDrone(
            @PathVariable Long id,
            @Valid @RequestBody DroneRequest request) {

        return ResponseEntity.ok(droneService.updateDrone(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDrone(@PathVariable Long id) {

        droneService.deleteDrone(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MAINTENANCE_ENGINEER')")
    public ResponseEntity<DroneHistoryResponse> getDroneHistory(@PathVariable Long id) {
        return ResponseEntity.ok(droneService.getHistory(id));
    }

}
