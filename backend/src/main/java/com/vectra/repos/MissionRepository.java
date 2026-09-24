package com.vectra.repos;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vectra.enums.MissionStatus;
import com.vectra.models.Mission;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {

    List<Mission> findByMissionStatus(MissionStatus missionStatus);
    long countByMissionStatus(MissionStatus missionStatus);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

}
