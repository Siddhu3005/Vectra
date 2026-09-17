package com.vectra.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MaintenanceRequest {

    @NotNull
    private Long droneId;

    @NotBlank
    private String issue;

    @NotBlank
    private String maintenanceType;

    private String remarks;
}
