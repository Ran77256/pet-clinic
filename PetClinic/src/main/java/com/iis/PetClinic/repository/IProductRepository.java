package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findAllByItem_Id(int itemId);
    Product save(Product product);
    boolean existsByBarcode(int barcode);
    void deleteAllByItem_Id(int itemId);
}
