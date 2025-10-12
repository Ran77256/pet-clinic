package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Category;
import com.iis.PetClinic.model.Item;
import jakarta.annotation.Nullable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ICategoryRepository extends JpaRepository<Category, Integer> {

    Optional<Category> findById(int id);
    List<Category> findAll();
}
