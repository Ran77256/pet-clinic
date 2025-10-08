package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Role;
import com.iis.PetClinic.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<User, Integer> {

        Optional<User> findByEmail(String email);
        Optional<User> findByEmailAndRole(String email, Role role);


    List<User> findAllByRole(Role role);


    }
