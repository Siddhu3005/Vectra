package com.vectra.exceptions;

public class UserNotFoundException extends ResourceNotFoundException {
    public UserNotFoundException(String value) { super("User not found: " + value); }
}
