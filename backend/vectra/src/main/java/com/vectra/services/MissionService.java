package com.vectra.services;

import java.util.List;

import com.vectra.dto.request.MissionRequest;
import com.vectra.models.Mission;

public interface MissionService {

    Mission createMission(MissionRequest request);

    List<Mission> getAllMissions();

    Mission getMission(Long id);
    Mission updateMission(Long id, MissionRequest request);

}
