package com.vectra.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vectra.enums.AvailabilityStatus;
import com.vectra.models.Operator;
import java.util.Optional;

@Repository
public interface OperatorRepository extends JpaRepository<Operator, Long> {

    List<Operator> findByAvailabilityStatus(AvailabilityStatus availabilityStatus);
    Optional<Operator> findByUser_EmailIgnoreCase(String email);

}
