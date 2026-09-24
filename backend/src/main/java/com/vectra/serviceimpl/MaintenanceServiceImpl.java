package com.vectra.serviceimpl;

import com.vectra.dto.request.MaintenanceRequest;
import com.vectra.enums.*;
import com.vectra.exceptions.*;
import com.vectra.models.*;
import com.vectra.repos.*;
import com.vectra.services.MaintenanceService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MaintenanceServiceImpl implements MaintenanceService {
    private final MaintenanceRepository maintenance;
    private final DroneRepository drones;
    public MaintenanceServiceImpl(MaintenanceRepository maintenance, DroneRepository drones) {
        this.maintenance = maintenance; this.drones = drones;
    }
    @Override public List<Maintenance> getAllMaintenance() { return maintenance.findAll(); }
    @Override @Transactional
    public Maintenance create(MaintenanceRequest r) {
        Drone drone = drones.findById(r.getDroneId()).orElseThrow(() -> new DroneNotFoundException(r.getDroneId()));
        Maintenance m = new Maintenance();
        m.setDrone(drone); m.setIssue(r.getIssue()); m.setMaintenanceType(r.getMaintenanceType());
        m.setRemarks(r.getRemarks()); m.setStatus(MaintenanceStatus.PENDING); m.setStartDate(LocalDate.now());
        drone.setStatus(DroneStatus.MAINTENANCE); drones.save(drone);
        return maintenance.save(m);
    }
    @Override @Transactional
    public Maintenance update(Long id, MaintenanceRequest r) {
        Maintenance m = get(id);
        if (m.getStatus() == MaintenanceStatus.COMPLETED) throw new ValidationException("Completed maintenance cannot be updated");
        m.setIssue(r.getIssue()); m.setMaintenanceType(r.getMaintenanceType()); m.setRemarks(r.getRemarks());
        m.setStatus(MaintenanceStatus.IN_PROGRESS); return maintenance.save(m);
    }
    @Override @Transactional
    public Maintenance complete(Long id) {
        Maintenance m = get(id); m.setStatus(MaintenanceStatus.COMPLETED); m.setCompletedDate(LocalDate.now());
        Drone drone = m.getDrone();
        drone.setStatus(drone.getBatteryPercentage() >= drone.getMinimumReserve() ? DroneStatus.AVAILABLE : DroneStatus.CHARGING);
        drones.save(drone); return maintenance.save(m);
    }
    @Override public List<Maintenance> history(Long droneId) {
        Drone drone = drones.findById(droneId).orElseThrow(() -> new DroneNotFoundException(droneId));
        return maintenance.findByDroneOrderByStartDateDesc(drone);
    }
    private Maintenance get(Long id) {
        return maintenance.findById(id).orElseThrow(() -> new ResourceNotFoundException("Maintenance not found: " + id));
    }
}
