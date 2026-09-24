package com.vectra.exceptions;

public class DroneNotFoundException extends ResourceNotFoundException {
    public DroneNotFoundException(Long id) { super("Drone not found: " + id); }
}
