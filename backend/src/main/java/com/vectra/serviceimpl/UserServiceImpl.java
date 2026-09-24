package com.vectra.serviceimpl;

import com.vectra.dto.request.RegisterRequest;
import com.vectra.enums.AvailabilityStatus;
import com.vectra.enums.UserRole;
import com.vectra.exceptions.UserNotFoundException;
import com.vectra.models.Operator;
import com.vectra.models.User;
import com.vectra.repos.OperatorRepository;
import com.vectra.repos.UserRepository;
import com.vectra.services.UserService;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository users;
    private final OperatorRepository operators;
    private final PasswordEncoder encoder;
    public UserServiceImpl(UserRepository users, OperatorRepository operators, PasswordEncoder encoder) {
        this.users = users; this.operators = operators; this.encoder = encoder;
    }
    @Override public List<User> getAll() { return users.findAll(); }
    @Override public User get(Long id) { return users.findById(id).orElseThrow(() -> new UserNotFoundException(id.toString())); }
    @Override @Transactional public User update(Long id, RegisterRequest r) {
        User u = get(id);
        UserRole previousRole = u.getRole();
        u.setFullName(r.getFullName()); u.setEmail(r.getEmail().toLowerCase());
        u.setPassword(encoder.encode(r.getPassword())); u.setPhone(r.getPhone()); u.setRole(r.getRole());
        users.save(u);
        if (r.getRole() == UserRole.OPERATOR && previousRole != UserRole.OPERATOR
                && !operators.findByUser_EmailIgnoreCase(u.getEmail()).isPresent()) {
            Operator operator = new Operator();
            operator.setUser(u);
            operator.setLicenseNumber("LIC-" + u.getEmail().split("@")[0].toUpperCase());
            operator.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
            operator.setExperienceYears(0);
            operators.save(operator);
        }
        return u;
    }
    @Override @Transactional public void delete(Long id) { User u = get(id); u.setActive(false); users.save(u); }
}
