package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.request.LoginDTO;
import com.iis.PetClinic.dto.request.RegisterDTO;
import com.iis.PetClinic.dto.response.LoginResponse;
import com.iis.PetClinic.model.User;
import org.springframework.http.ResponseEntity;

public interface IUserService {
    ResponseEntity<LoginResponse> login(LoginDTO loginDTO);
    ResponseEntity<LoginResponse> register(RegisterDTO registerDTO);
    User getUserByEmail(String email);

}
