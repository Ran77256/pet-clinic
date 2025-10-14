package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IItemRepository extends JpaRepository<Item, Integer> {

    Optional<Item> findById(int id);
    List<Item> findAllByCategory_Id(int categoryId);

    List<Item> findByCategory_Id(Integer categoryId);
}
