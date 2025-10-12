package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.request.AddProductRequest;
import com.iis.PetClinic.dto.response.ProductResponse;

import java.util.List;
import java.util.Optional;

public interface IProductService {
    List<ProductResponse> getAllProductsByItemId(int itemId);
    ProductResponse addProduct(AddProductRequest product);
}
