package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.AddProductRequest;
import com.iis.PetClinic.dto.response.ExpirationRiskDTO;
import com.iis.PetClinic.dto.response.ItemTotalQuantityDTO;
import com.iis.PetClinic.dto.response.ProductResponse;
import com.iis.PetClinic.dto.response.WriteOffDTO;
import com.iis.PetClinic.service.IProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/topexpired")
    public List<WriteOffDTO> getTop5ExpiredWriteOffs(){
        return productService.getTop5ExpiredWriteOffs();
    }

    @GetMapping("expirationrisk")
    public List<ExpirationRiskDTO> getExpirationRiskItems(){
        return productService.getExpirationRiskItems();
    }

    @GetMapping("/summary-available")
    public ResponseEntity<List<ItemTotalQuantityDTO>> getAvailableStockSummary() {
        List<ItemTotalQuantityDTO> summary = productService.getAvailableStockSummary();
        return ResponseEntity.ok(summary);
    }
}
