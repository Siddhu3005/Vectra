package com.vectra.serviceimpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vectra.dto.request.DroneRequest;
import com.vectra.models.Drone;
import com.vectra.repos.DroneRepository;
import com.vectra.services.DroneService;
import com.vectra.enums.DroneStatus;
import com.vectra.exceptions.*;
import com.vectra.dto.response.DroneHistoryResponse;
import com.vectra.repos.AssignmentRepository;
import com.vectra.repos.MaintenanceRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DroneServiceImpl implements DroneService {

    private final DroneRepository droneRepository;
    private final AssignmentRepository assignmentRepository;
    private final MaintenanceRepository maintenanceRepository;

    public DroneServiceImpl(DroneRepository droneRepository, AssignmentRepository assignmentRepository,
            MaintenanceRepository maintenanceRepository) {
        this.droneRepository = droneRepository;
        this.assignmentRepository = assignmentRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    @Override
    @Transactional
    public Drone createDrone(DroneRequest request) {
        if (droneRepository.existsByDroneCode(request.getDroneCode())
                || droneRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new ValidationException("Drone code and serial number must be unique");
        }

        Drone drone = new Drone();

        drone.setDroneCode(request.getDroneCode());
        drone.setSerialNumber(request.getSerialNumber());
        drone.setModel(request.getModel());
        drone.setPayloadCapacity(request.getPayloadCapacity());
        drone.setBatteryPercentage(request.getBatteryPercentage());
        drone.setBatteryPerKm(request.getBatteryPerKm());
        drone.setBatteryPerKg(request.getBatteryPerKg());
        drone.setMinimumReserve(request.getMinimumReserve());
        drone.setCurrentLocation(request.getCurrentLocation());
        drone.setStatus(DroneStatus.AVAILABLE);
        drone.setFlightCount(0);

        return droneRepository.save(drone);
    }

    @Override
    public List<Drone> getAllDrones() {
        return droneRepository.findAll();
    }

    @Override
    public Drone getDroneById(Long id) {

        return droneRepository.findById(id)
                .orElseThrow(() -> new DroneNotFoundException(id));
    }

    @Override
    @Transactional
    public Drone updateDrone(Long id, DroneRequest request) {

        Drone drone = getDroneById(id);

        drone.setDroneCode(request.getDroneCode());
        drone.setSerialNumber(request.getSerialNumber());
        drone.setModel(request.getModel());
        drone.setPayloadCapacity(request.getPayloadCapacity());
        drone.setBatteryPercentage(request.getBatteryPercentage());
        drone.setBatteryPerKm(request.getBatteryPerKm());
        drone.setBatteryPerKg(request.getBatteryPerKg());
        drone.setMinimumReserve(request.getMinimumReserve());
        drone.setCurrentLocation(request.getCurrentLocation());

        return droneRepository.save(drone);
    }

    @Override
    @Transactional
    public void deleteDrone(Long id) {

        Drone drone = getDroneById(id);

        droneRepository.delete(drone);
    }

    @Override
    public DroneHistoryResponse getHistory(Long id) {
        Drone drone = getDroneById(id);
        var assignments = assignmentRepository.findByDrone(drone);
        var missions = assignments.stream().map(com.vectra.models.Assignment::getMission).toList();
        var records = maintenanceRepository.findByDroneOrderByStartDateDesc(drone);
        return new DroneHistoryResponse(drone, assignments, missions, records,
                drone.getFlightCount(), drone.getBatteryPercentage());
    }
}
