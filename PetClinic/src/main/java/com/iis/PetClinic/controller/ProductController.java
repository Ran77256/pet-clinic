package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.AddProductRequest;
import com.iis.PetClinic.dto.response.ProductResponse;
import com.iis.PetClinic.service.IProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private IProductService productService;

    @GetMapping("/products/{itemId}")
    public List<ProductResponse> getAllProductsByItemId(@PathVariable int itemId){
        return productService.getAllProductsByItemId(itemId);
    }

    @PostMapping("/addproduct")
    public ProductResponse addNewProduct(@RequestBody AddProductRequest request){
        return productService.addProduct(request);
    }
}
