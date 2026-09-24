package com.vectra.serviceimpl;

import com.vectra.dto.request.*;
import com.vectra.dto.response.LoginResponse;
import com.vectra.enums.AvailabilityStatus;
import com.vectra.enums.UserRole;
import com.vectra.exceptions.ValidationException;
import com.vectra.models.Operator;
import com.vectra.models.User;
import com.vectra.repos.OperatorRepository;
import com.vectra.repos.UserRepository;
import com.vectra.security.CustomUserDetailsService;
import com.vectra.services.AuthService;
import com.vectra.utils.JwtUtil;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository users;
    private final OperatorRepository operators;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository users, OperatorRepository operators, PasswordEncoder encoder,
            AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.users = users; this.operators = operators; this.encoder = encoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService; this.jwtUtil = jwtUtil;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        User user = users.findByEmail(email).orElseThrow();
        UserDetails details = userDetailsService.loadUserByUsername(email);
        return new LoginResponse(jwtUtil.generateToken(details), user.getFullName(), user.getRole().name());
    }

    @Override @Transactional
    public String register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase();
        if (users.existsByEmail(email)) throw new ValidationException("Email is already registered");
        User user = new User();
        user.setFullName(request.getFullName()); user.setEmail(email);
        user.setPassword(encoder.encode(request.getPassword())); user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        users.save(user);
        if (request.getRole() == UserRole.OPERATOR) {
            Operator operator = new Operator();
            operator.setUser(user);
            operator.setLicenseNumber("LIC-" + email.split("@")[0].toUpperCase());
            operator.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
            operator.setExperienceYears(0);
            operators.save(operator);
        }
        return "User registered successfully";
    }
}
