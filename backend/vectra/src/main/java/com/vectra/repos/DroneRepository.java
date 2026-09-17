package com.vectra.repos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vectra.enums.DroneStatus;
import com.vectra.models.Drone;

@Repository
public interface DroneRepository extends JpaRepository<Drone, Long> {

    Optional<Drone> findByDroneCode(String droneCode);
    boolean existsByDroneCode(String droneCode);
    boolean existsBySerialNumber(String serialNumber);

    List<Drone> findByStatus(DroneStatus status);
    long countByStatus(DroneStatus status);

}
