package com.vectra.services;

import com.vectra.dto.request.LoginRequest;
import com.vectra.dto.request.RegisterRequest;
import com.vectra.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    String register(RegisterRequest request);

}