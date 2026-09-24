package com.vectra.services;

import java.util.List;

import com.vectra.models.Operator;
import com.vectra.dto.request.OperatorRequest;

public interface OperatorService {

    List<Operator> getAllOperators();

    Operator getOperator(Long id);
    Operator create(OperatorRequest request);
    Operator update(Long id, OperatorRequest request);
    void delete(Long id);

}
