package com.vectra.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignmentRequest {

    @NotNull
    private Long missionId;
}
