package com.iis.PetClinic.dto.request;

import com.iis.PetClinic.model.Role;

public class RegisterDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String confirmPassword;
    private Role role; // enum: VETERINARIAN, MANAGER, ANIMALS_ADMIN, PRICE_ADMIN, WAREHOUSE_ADMIN

    // getteri i setteri

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public Role getRole() {
        return role;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
