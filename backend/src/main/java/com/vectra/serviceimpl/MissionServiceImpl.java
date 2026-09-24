package com.vectra.serviceimpl;

import com.vectra.dto.request.MissionRequest;
import com.vectra.enums.*;
import com.vectra.exceptions.MissionNotFoundException;
import com.vectra.models.Mission;
import com.vectra.repos.MissionRepository;
import com.vectra.services.MissionService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MissionServiceImpl implements MissionService {
    private final MissionRepository missions;
    public MissionServiceImpl(MissionRepository missions) { this.missions = missions; }

    @Override @Transactional
    public Mission createMission(MissionRequest r) {
        Mission m = new Mission();
        apply(m, r); m.setMissionStatus(MissionStatus.PENDING);
        return missions.save(m);
    }
    @Override public List<Mission> getAllMissions() { return missions.findAll(); }
    @Override public Mission getMission(Long id) {
        return missions.findById(id).orElseThrow(() -> new MissionNotFoundException(id));
    }
    @Override @Transactional
    public Mission updateMission(Long id, MissionRequest r) {
        Mission m = getMission(id);
        if (m.getMissionStatus() != MissionStatus.PENDING) throw new IllegalStateException("Only pending missions can be updated");
        apply(m, r); return missions.save(m);
    }
    private void apply(Mission m, MissionRequest r) {
        m.setMissionType(r.getMissionType()); m.setPickupLocation(r.getPickupLocation());
        m.setDestination(r.getDestination()); m.setPackageWeight(r.getPackageWeight());
        m.setCurrentToPickupDistance(r.getCurrentToPickupDistance());
        m.setPickupToDestinationDistance(r.getPickupToDestinationDistance());
        m.setDestinationToWarehouseDistance(r.getDestinationToWarehouseDistance());
        m.setPriority(r.getPriority());
    }
}
