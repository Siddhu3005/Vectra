package com.vectra.services;

import java.util.List;

import com.vectra.dto.request.DroneRequest;
import com.vectra.models.Drone;
import com.vectra.dto.response.DroneHistoryResponse;

public interface DroneService {

    Drone createDrone(DroneRequest request);

    List<Drone> getAllDrones();

    Drone getDroneById(Long id);

    Drone updateDrone(Long id, DroneRequest request);

    void deleteDrone(Long id);
    DroneHistoryResponse getHistory(Long id);

}
