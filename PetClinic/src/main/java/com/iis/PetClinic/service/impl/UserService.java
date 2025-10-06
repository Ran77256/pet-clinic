package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.request.LoginDTO;
import com.iis.PetClinic.dto.request.RegisterDTO;
import com.iis.PetClinic.dto.response.LoginResponse;
import com.iis.PetClinic.model.Role;
import com.iis.PetClinic.model.User;
import com.iis.PetClinic.repository.IUserRepository;
import com.iis.PetClinic.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService implements IUserService {
    @Autowired
    private PasswordEncoder passwordEncoder;


    @Autowired
    private IUserRepository userRepository;

    @Override
    public ResponseEntity<LoginResponse> login(LoginDTO loginDTO) {
        Optional<User> userOpt = userRepository.findByEmail(loginDTO.getEmail());
        if (userOpt.isEmpty()) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }

        User user = userOpt.get();

        if (!loginDTO.getPassword().equals(user.getPassword())) {
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }

        user.setLastActivated(LocalDateTime.now());
        userRepository.save(user);

        var response = new LoginResponse("Login successful", user.getRole().toString());

        return new ResponseEntity<>(response, HttpStatus.OK);

    }
    @Override
    public ResponseEntity<LoginResponse> register(RegisterDTO registerDTO) {
        if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(new LoginResponse("Passwords do not match"));
        }

        // provera da li već postoji
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new LoginResponse("Email already exists"));
        }

        User user = new User();
        user.setFirstName(registerDTO.getFirstName());
        user.setLastName(registerDTO.getLastName());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setRole(Role.USER);

        userRepository.save(user);

        return ResponseEntity.ok(new LoginResponse("Registration successful"));
    }

}
