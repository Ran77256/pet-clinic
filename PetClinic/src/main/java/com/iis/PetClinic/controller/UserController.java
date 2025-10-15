package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.LoginDTO;
import com.iis.PetClinic.dto.request.RegisterDTO;
import com.iis.PetClinic.dto.response.LoginResponse;
import com.iis.PetClinic.dto.response.UserDTO;
import com.iis.PetClinic.model.User;
import com.iis.PetClinic.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class UserController {

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
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam String email) {
        UserDTO user = userService.getUserByEmail(email);

        UserDTO dto = UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .lastActivated(user.getLastActivated())
                // ako želiš da se vrate i ljubimci (ako imaš PetDTO)
                //.pets(user.getPets().stream().map(PetDTO::fromEntity).toList())
                .build();

        return ResponseEntity.ok(dto);
    }


    @GetMapping("/user/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

}
