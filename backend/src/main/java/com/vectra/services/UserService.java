package com.vectra.services;

import com.vectra.dto.request.RegisterRequest;
import com.vectra.models.User;
import java.util.List;

public interface UserService {
    List<User> getAll();
    User get(Long id);
    User update(Long id, RegisterRequest request);
    void delete(Long id);
}
