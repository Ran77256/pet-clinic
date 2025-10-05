package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.LoginDTO;
import com.iis.PetClinic.dto.response.LoginResponse;
import com.iis.PetClinic.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private IUserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginDTO loginDTO){
        return userService.login(loginDTO);
    }
}
