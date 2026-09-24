package com.vectra.serviceimpl;

import com.vectra.dto.request.AssignmentRequest;
import com.vectra.enums.*;
import com.vectra.exceptions.*;
import com.vectra.models.*;
import com.vectra.repos.*;
import com.vectra.services.AssignmentService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Comparator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssignmentServiceImpl implements AssignmentService {
    private static final int MAINTENANCE_FLIGHT_THRESHOLD = 10;
    private final AssignmentRepository assignments;
    private final MissionRepository missions;
    private final DroneRepository drones;
    private final MaintenanceRepository maintenance;
    private final OperatorRepository operators;
    private final UserRepository users;

    public AssignmentServiceImpl(AssignmentRepository assignments, MissionRepository missions,
            DroneRepository drones, MaintenanceRepository maintenance, OperatorRepository operators,
            UserRepository users) {
        this.assignments = assignments; this.missions = missions;
        this.drones = drones; this.maintenance = maintenance; this.operators = operators;
        this.users = users;
    }

    @Override @Transactional
    public Assignment assignDrone(AssignmentRequest request) {
        Mission mission = missions.findById(request.getMissionId())
                .orElseThrow(() -> new MissionNotFoundException(request.getMissionId()));
        if (mission.getMissionStatus() != MissionStatus.PENDING || assignments.existsByMission_MissionId(mission.getMissionId()))
            throw new AssignmentException("Mission is not available for assignment");

        Drone best = drones.findByStatus(DroneStatus.AVAILABLE).stream()
                .filter(d -> d.getPayloadCapacity() >= mission.getPackageWeight())
                .filter(d -> !maintenance.existsByDroneAndStatusNot(d, MaintenanceStatus.COMPLETED))
                .filter(d -> remaining(d, mission) >= d.getMinimumReserve())
                .max(Comparator.comparingDouble(d -> remaining(d, mission)))
                .orElseThrow(() -> new AssignmentException("No eligible drone is available"));

        double required = required(best, mission);
        mission.setEstimatedBatteryRequired(required);
        mission.setMissionStatus(MissionStatus.RECOMMENDED);
        best.setStatus(DroneStatus.ASSIGNED);
        Assignment assignment = new Assignment();
        assignment.setMission(mission); assignment.setDrone(best);
        assignment.setAssignmentStatus(AssignmentStatus.RECOMMENDED);
        missions.save(mission); drones.save(best);
        return assignments.save(assignment);
    }

    @Override @Transactional
    public Assignment completeAssignment(Long id) {
        Assignment assignment = assignments.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + id));
        return complete(assignment);
    }

    @Override
    public List<Assignment> getAll() {
        return assignments.findAll();
    }

    @Override
    public List<Assignment> getRecommended() {
        return assignments.findByAssignmentStatus(AssignmentStatus.RECOMMENDED);
    }

    @Override
    @Transactional
    public Assignment assignOperator(Long assignmentId, Long operatorId) {
        Assignment assignment = assignments.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        if (assignment.getAssignmentStatus() != AssignmentStatus.RECOMMENDED)
            throw new AssignmentException("Only recommended assignments can be assigned");
        Operator operator = operators.findById(operatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Operator not found: " + operatorId));
        if (operator.getAvailabilityStatus() != AvailabilityStatus.AVAILABLE)
            throw new AssignmentException("Operator is not available");
        assignment.setOperator(operator);
        assignment.setAssignmentStatus(AssignmentStatus.ASSIGNED);
        assignment.getMission().setMissionStatus(MissionStatus.ASSIGNED);
        assignment.getDrone().setStatus(DroneStatus.IN_MISSION);
        operator.setAvailabilityStatus(AvailabilityStatus.BUSY);
        operators.save(operator); missions.save(assignment.getMission()); drones.save(assignment.getDrone());
        return assignments.save(assignment);
    }

    @Override
    public List<Mission> getMyMissions(String email) {
        return operators.findByUser_EmailIgnoreCase(email)
                .map(operator -> assignments.findByOperator(operator).stream().map(Assignment::getMission).toList())
                .orElse(List.of());
    }

    @Override
    @Transactional
    public Mission startMission(Long missionId, String email) {
        Assignment assignment = ownedAssignment(missionId, email);
        if (assignment.getMission().getMissionStatus() != MissionStatus.ASSIGNED
                || assignment.getAssignmentStatus() != AssignmentStatus.ASSIGNED)
            throw new AssignmentException("Mission is not ready to start");
        if (assignment.getDrone() == null) throw new AssignmentException("Assignment has no drone");
        assignment.setAssignmentStatus(AssignmentStatus.IN_PROGRESS);
        assignment.getMission().setMissionStatus(MissionStatus.IN_PROGRESS);
        assignment.getMission().setStartTime(LocalDateTime.now());
        assignments.save(assignment);
        return missions.save(assignment.getMission());
    }

    @Override
    @Transactional
    public Mission completeMission(Long missionId, String email) {
        Assignment assignment = ownedAssignment(missionId, email);
        if (assignment.getMission().getMissionStatus() != MissionStatus.IN_PROGRESS
                || assignment.getAssignmentStatus() != AssignmentStatus.IN_PROGRESS)
            throw new AssignmentException("Only an in-progress mission can be completed");
        return complete(assignment).getMission();
    }

    private Assignment complete(Assignment assignment) {
        if (assignment.getAssignmentStatus() == AssignmentStatus.COMPLETED)
            throw new AssignmentException("Assignment is already completed");
        Drone drone = assignment.getDrone();
        Mission mission = assignment.getMission();
        double remaining = Math.max(0, drone.getBatteryPercentage() - required(drone, mission));
        drone.setBatteryPercentage(remaining);
        drone.setFlightCount(drone.getFlightCount() + 1);
        assignment.setAssignmentStatus(AssignmentStatus.COMPLETED);
        mission.setMissionStatus(MissionStatus.COMPLETED);
        mission.setEndTime(LocalDateTime.now());
        if (assignment.getOperator() != null) {
            assignment.getOperator().setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
            assignment.getOperator().setTotalMissions(assignment.getOperator().getTotalMissions() + 1);
            operators.save(assignment.getOperator());
        }
        if (drone.getFlightCount() % MAINTENANCE_FLIGHT_THRESHOLD == 0) {
            drone.setStatus(DroneStatus.MAINTENANCE);
            Maintenance record = new Maintenance();
            record.setDrone(drone); record.setIssue("Scheduled maintenance threshold reached");
            record.setMaintenanceType("SCHEDULED"); record.setStatus(MaintenanceStatus.PENDING);
            record.setStartDate(LocalDate.now()); maintenance.save(record);
        } else {
            drone.setStatus(remaining >= drone.getMinimumReserve() ? DroneStatus.AVAILABLE : DroneStatus.CHARGING);
        }
        drones.save(drone); missions.save(mission);
        return assignments.save(assignment);
    }

    private Operator operatorFor(String email) {
        return operators.findByUser_EmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Operator profile not found for authenticated user"));
    }

    private Assignment ownedAssignment(Long missionId, String email) {
        Mission mission = missions.findById(missionId)
                .orElseThrow(() -> new MissionNotFoundException(missionId));
        Assignment assignment = assignments.findByMission(mission)
                .orElseThrow(() -> new AssignmentException("Mission has no assignment"));
        User user = users.findByEmail(email.toLowerCase())
                .orElse(null);
        if (user != null && user.getRole() == UserRole.ADMIN) {
            return assignment;
        }
        Operator operator = operatorFor(email);
        if (assignment.getOperator() == null || !assignment.getOperator().getOperatorId().equals(operator.getOperatorId()))
            throw new AssignmentException("Mission is not assigned to the authenticated operator");
        return assignment;
    }

    private double required(Drone d, Mission m) {
        return (m.getTotalDistance() * d.getBatteryPerKm()) + (m.getPackageWeight() * d.getBatteryPerKg());
    }
    private double remaining(Drone d, Mission m) { return d.getBatteryPercentage() - required(d, m); }
}
