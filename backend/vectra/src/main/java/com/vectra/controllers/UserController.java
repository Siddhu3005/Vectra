package com.vectra.controllers;

import com.vectra.dto.request.RegisterRequest;
import com.vectra.models.User;
import com.vectra.services.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/users")
public class UserController {
    private final UserService users;
    public UserController(UserService users) { this.users = users; }
    @GetMapping public List<User> all() { return users.getAll(); }
    @GetMapping("/{id}") public User get(@PathVariable Long id) { return users.get(id); }
    @PutMapping("/{id}") public User update(@PathVariable Long id, @Valid @RequestBody RegisterRequest r) { return users.update(id, r); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        users.delete(id); return ResponseEntity.noContent().build();
    }
}
