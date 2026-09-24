package com.vectra.services;

import java.util.List;

import com.vectra.models.Maintenance;
import com.vectra.dto.request.MaintenanceRequest;

public interface MaintenanceService {

    List<Maintenance> getAllMaintenance();
    Maintenance create(MaintenanceRequest request);
    Maintenance update(Long id, MaintenanceRequest request);
    Maintenance complete(Long id);
    List<Maintenance> history(Long droneId);

}
