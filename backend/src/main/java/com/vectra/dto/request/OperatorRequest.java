package com.vectra.dto.request;

import com.vectra.enums.AvailabilityStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class OperatorRequest {
    @NotNull private Long userId;
    @NotBlank private String licenseNumber;
    private String certification;
    @NotNull private AvailabilityStatus availabilityStatus;
    @PositiveOrZero private int experienceYears;
}
