package com.vectra.dto.request;

import com.vectra.enums.UserRole;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String fullName;

    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 8)
    private String password;

    @Pattern(regexp = "^\\+?[0-9]{7,15}$")
    private String phone;

    @NotNull
    private UserRole role;
}
