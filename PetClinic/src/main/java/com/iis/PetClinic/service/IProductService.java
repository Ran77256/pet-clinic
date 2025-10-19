package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.request.AddProductRequest;
import com.iis.PetClinic.dto.response.ExpirationRiskDTO;
import com.iis.PetClinic.dto.response.ItemTotalQuantityDTO;
import com.iis.PetClinic.dto.response.ProductResponse;
import com.iis.PetClinic.dto.response.WriteOffDTO;
import com.iis.PetClinic.model.Order;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

public interface IProductService {
    List<ProductResponse> getAllProductsByItemId(int itemId);
    ProductResponse addProduct(AddProductRequest product);
    void writeOffProduct();
    void updateProductsAfterOrder(Order order);
    List<WriteOffDTO> getTop5ExpiredWriteOffs();
    List<ExpirationRiskDTO> getExpirationRiskItems();
    List<ItemTotalQuantityDTO> getAvailableStockSummary();
}
