package com.vectra.controllers;

import com.vectra.dto.request.MissionRequest;
import com.vectra.models.Mission;
import com.vectra.services.MissionService;
import com.vectra.services.AssignmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/missions")
public class MissionController {
    private final MissionService missions;
    private final AssignmentService assignments;

    public MissionController(MissionService missions, AssignmentService assignments) {
        this.missions = missions;
        this.assignments = assignments;
    }

    @GetMapping
    public List<Mission> all() {
        return missions.getAllMissions();
    }

    @GetMapping("/{id}")
    public Mission get(@PathVariable Long id) {
        return missions.getMission(id);
    }

    @PostMapping
    public ResponseEntity<Mission> create(@Valid @RequestBody MissionRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(missions.createMission(r));
    }

    @PutMapping("/{id}")
    public Mission update(@PathVariable Long id, @Valid @RequestBody MissionRequest r) {
        return missions.updateMission(id, r);
    }

    @PutMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public Mission start(@PathVariable Long id, Authentication authentication) {
        return assignments.startMission(id, authentication.getName());
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public Mission complete(@PathVariable Long id, Authentication authentication) {
        return assignments.completeMission(id, authentication.getName());
    }
}
