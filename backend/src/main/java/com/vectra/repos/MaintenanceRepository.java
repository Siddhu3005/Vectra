package com.vectra.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vectra.enums.MaintenanceStatus;
import com.vectra.models.Maintenance;
import com.vectra.models.Drone;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByStatus(MaintenanceStatus status);
    List<Maintenance> findByDroneOrderByStartDateDesc(Drone drone);
    boolean existsByDroneAndStatusNot(Drone drone, MaintenanceStatus status);

}
