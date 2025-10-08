package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.LoginDTO;
import com.iis.PetClinic.dto.request.RegisterDTO;
import com.iis.PetClinic.dto.response.LoginResponse;

import com.iis.PetClinic.dto.response.VetLiteDTO;
import com.iis.PetClinic.model.Role;
import com.iis.PetClinic.model.User;
import com.iis.PetClinic.repository.IUserRepository;

import com.iis.PetClinic.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class UserController {
    private final IUserRepository userRepo;

    public UserController(IUserRepository userRepo) {
        this.userRepo = userRepo;
    }
    @Autowired
    private IUserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginDTO loginDTO){
        return userService.login(loginDTO);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterDTO registerDTO) {
        return userService.register(registerDTO);
    }
    @GetMapping("/user")
    public ResponseEntity<User> getUserByEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }


    // GET /api/veterinarians
    @GetMapping("/veterinarians")
    public List<VetLiteDTO> veterinarians() {
        return userRepo.findAllByRole(Role.VETERINARIAN)
                .stream()
                .map(u -> new VetLiteDTO(u.getId(), u.getFirstName(), u.getLastName()))
                .toList();
    }


    @GetMapping("/users")
    public List<VetLiteDTO> usersByRole(@RequestParam(required = false) Role role) {
        if (role == Role.VETERINARIAN) {
            return veterinarians();
        }
        return List.of();
    }


}
