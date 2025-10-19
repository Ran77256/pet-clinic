package com.iis.PetClinic.repository;

import com.iis.PetClinic.dto.response.ItemOrderCountDTO;
import com.iis.PetClinic.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IOrderRepository extends JpaRepository<Order, Integer> {
    Order save(Order order);
    List<Order> findAll();
    @Query("SELECT NEW com.iis.PetClinic.dto.response.ItemOrderCountDTO(o.item, COUNT(o.item)) " +
                "FROM Order o " +
                "GROUP BY o.item " +
                "ORDER BY COUNT(o.item) DESC " +
                "LIMIT 5")
    List<ItemOrderCountDTO> findTop5OrderedItemsWithCount();
}
