package com.vectra.serviceimpl;

import com.vectra.dto.request.OperatorRequest;
import com.vectra.exceptions.*;
import com.vectra.models.*;
import com.vectra.repos.*;
import com.vectra.services.OperatorService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OperatorServiceImpl implements OperatorService {
    private final OperatorRepository operators;
    private final UserRepository users;
    public OperatorServiceImpl(OperatorRepository operators, UserRepository users) {
        this.operators = operators; this.users = users;
    }
    @Override public List<Operator> getAllOperators() { return operators.findAll(); }
    @Override public Operator getOperator(Long id) {
        return operators.findById(id).orElseThrow(() -> new ResourceNotFoundException("Operator not found: " + id));
    }
    @Override @Transactional public Operator create(OperatorRequest r) {
        Operator o = new Operator(); apply(o, r); return operators.save(o);
    }
    @Override @Transactional public Operator update(Long id, OperatorRequest r) {
        Operator o = getOperator(id); apply(o, r); return operators.save(o);
    }
    @Override @Transactional public void delete(Long id) { operators.delete(getOperator(id)); }
    private void apply(Operator o, OperatorRequest r) {
        User user = users.findById(r.getUserId()).orElseThrow(() -> new UserNotFoundException(r.getUserId().toString()));
        o.setUser(user); o.setLicenseNumber(r.getLicenseNumber()); o.setCertification(r.getCertification());
        o.setAvailabilityStatus(r.getAvailabilityStatus()); o.setExperienceYears(r.getExperienceYears());
    }
}
