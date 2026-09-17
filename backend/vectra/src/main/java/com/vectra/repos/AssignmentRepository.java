package com.vectra.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vectra.models.Assignment;
import com.vectra.models.Drone;
import com.vectra.models.Mission;
import com.vectra.models.Operator;
import com.vectra.enums.AssignmentStatus;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByDrone(Drone drone);
    List<Assignment> findByAssignmentStatus(AssignmentStatus status);
    List<Assignment> findByOperator(Operator operator);
    java.util.Optional<Assignment> findByMission(Mission mission);
    boolean existsByMission_MissionId(Long missionId);

}
