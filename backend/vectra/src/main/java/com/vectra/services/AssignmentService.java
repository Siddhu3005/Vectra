package com.vectra.services;

import com.vectra.dto.request.AssignmentRequest;
import com.vectra.models.Assignment;
import com.vectra.models.Mission;
import java.util.List;

public interface AssignmentService {

    Assignment assignDrone(AssignmentRequest request);
    Assignment completeAssignment(Long id);
    List<Assignment> getAll();
    List<Assignment> getRecommended();
    Assignment assignOperator(Long assignmentId, Long operatorId);
    List<Mission> getMyMissions(String email);
    Mission startMission(Long missionId, String email);
    Mission completeMission(Long missionId, String email);

}
