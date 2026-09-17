package com.vectra.exceptions;

public class MissionNotFoundException extends ResourceNotFoundException {
    public MissionNotFoundException(Long id) { super("Mission not found: " + id); }
}
