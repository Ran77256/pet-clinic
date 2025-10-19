package com.iis.PetClinic.repository;

import com.iis.PetClinic.dto.projection.ExpirationRiskProjection;
import com.iis.PetClinic.dto.response.ItemTotalQuantityDTO;
import com.iis.PetClinic.dto.response.WriteOffDTO;
import com.iis.PetClinic.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findAllByItem_Id(int itemId);
    Product save(Product product);
    boolean existsByBarcode(int barcode);
    void deleteAllByItem_Id(int itemId);
    @Query("SELECT new com.iis.PetClinic.dto.response.WriteOffDTO(p.item.name, COUNT(p)) " +
            "FROM Product p " +
            "WHERE p.reason = 'istek roka' " +
            "GROUP BY p.item.name " +
            "ORDER BY COUNT(p) DESC")
    Page<WriteOffDTO> findTopExpiredWriteOffs(Pageable pageable);

    @Query(value = "SELECT i.name AS item_name, p.expiration_date " +
            "FROM product p JOIN items i ON p.item_id = i.id " +
            "WHERE p.write_off_date IS NULL " +
            "AND p.expiration_date <= CURRENT_DATE + interval '30 day' " +
            "ORDER BY p.expiration_date ASC",
            nativeQuery = true)
    List<ExpirationRiskProjection> findExpirationRiskItems();

    @Query("""
        SELECT new com.iis.PetClinic.dto.response.ItemTotalQuantityDTO(p.item.name, SUM(p.quantity))
        FROM Product p
        WHERE p.reason IS NULL
        GROUP BY p.item.name
        """)
    List<ItemTotalQuantityDTO> findGroupedQuantitiesWithoutReason();
}
