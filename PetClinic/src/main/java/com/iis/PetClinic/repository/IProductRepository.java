package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findAllByItem_Id(int itemId);
    Product save(Product product);

    @Query(value = "SELECT * FROM get_inventory_report_fn()", nativeQuery = true)
    List<Object[]> getInventoryExpiryReport();
}
