package com.vectra.controllers;

import com.vectra.dto.request.AssignmentRequest;
import com.vectra.dto.request.OperatorAssignmentRequest;
import com.vectra.models.Assignment;
import com.vectra.services.AssignmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/assignments")
public class AssignmentController {
    private final AssignmentService assignments;
    public AssignmentController(AssignmentService assignments) { this.assignments = assignments; }
    @PostMapping("/assign") public ResponseEntity<Assignment> assign(@Valid @RequestBody AssignmentRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignments.assignDrone(r));
    }
    @PostMapping("/{id}/complete") public Assignment complete(@PathVariable Long id) {
        return assignments.completeAssignment(id);
    }
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'OPERATOR')")
    public List<Assignment> all() {
        return assignments.getAll();
    }
    @GetMapping("/recommended")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'OPERATOR')")
    public List<Assignment> recommended() {
        return assignments.getRecommended();
    }
    @PutMapping("/{id}/assign-operator")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public Assignment assignOperator(@PathVariable Long id, @Valid @RequestBody OperatorAssignmentRequest request) {
        return assignments.assignOperator(id, request.getOperatorId());
    }
}
