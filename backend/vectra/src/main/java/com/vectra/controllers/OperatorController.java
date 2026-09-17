package com.vectra.controllers;

import com.vectra.dto.request.OperatorRequest;
import com.vectra.enums.AvailabilityStatus;
import com.vectra.models.Operator;
import com.vectra.models.User;
import com.vectra.repos.OperatorRepository;
import com.vectra.repos.UserRepository;
import com.vectra.services.OperatorService;
import com.vectra.services.AssignmentService;
import com.vectra.models.Mission;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

@RestController @RequestMapping("/api/operators")
public class OperatorController {
    private final OperatorService operators;
    private final AssignmentService assignments;
    private final OperatorRepository operatorRepo;
    private final UserRepository userRepo;

    public OperatorController(OperatorService operators, AssignmentService assignments,
            OperatorRepository operatorRepo, UserRepository userRepo) {
        this.operators = operators; this.assignments = assignments;
        this.operatorRepo = operatorRepo; this.userRepo = userRepo;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('OPERATOR')")
    public Operator me(Authentication authentication) {
        return operatorRepo.findByUser_EmailIgnoreCase(authentication.getName())
                .orElseGet(() -> {
                    User user = userRepo.findByEmail(authentication.getName()).orElseThrow();
                    Operator o = new Operator();
                    o.setUser(user);
                    o.setLicenseNumber("LIC-" + user.getEmail().split("@")[0].toUpperCase());
                    o.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
                    o.setExperienceYears(0);
                    return operatorRepo.save(o);
                });
    }

    @GetMapping("/me/missions")
    @PreAuthorize("hasRole('OPERATOR')")
    public List<Mission> myMissions(Authentication authentication) {
        return assignments.getMyMissions(authentication.getName());
    }
    @GetMapping public List<Operator> all() { return operators.getAllOperators(); }
    @GetMapping("/{id}") public Operator get(@PathVariable Long id) { return operators.getOperator(id); }
    @PostMapping public ResponseEntity<Operator> create(@Valid @RequestBody OperatorRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(operators.create(r));
    }
    @PutMapping("/{id}") public Operator update(@PathVariable Long id, @Valid @RequestBody OperatorRequest r) { return operators.update(id, r); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        operators.delete(id); return ResponseEntity.noContent().build();
    }
}
