package com.vectra.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OperatorAssignmentRequest {
    @NotNull
    private Long operatorId;
}
