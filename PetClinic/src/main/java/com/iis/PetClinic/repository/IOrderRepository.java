package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IOrderRepository extends JpaRepository<Order, Integer> {
    Order save(Order order);
    List<Order> findAll();
}
