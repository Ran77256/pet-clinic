package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.request.AddProductRequest;
import com.iis.PetClinic.dto.response.ProductResponse;
import com.iis.PetClinic.exception.BarcodeAlreadyExistsException;
import com.iis.PetClinic.model.Product;
import com.iis.PetClinic.repository.IItemRepository;
import com.iis.PetClinic.repository.IProductRepository;
import com.iis.PetClinic.service.IProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ProductService implements IProductService {

    @Autowired
    private IProductRepository productRepository;

    @Autowired
    private IItemRepository itemRepository;

    @Override
    public List<ProductResponse> getAllProductsByItemId(int itemId){
        var products = productRepository.findAllByItem_Id(itemId);

        if(products.isEmpty()) {
        return null;
        }

        return products.stream().map(product -> {
            var productResponse = new ProductResponse();
            productResponse.setBarcode(product.getBarcode());
            productResponse.setEntryDate(product.getEntryDate());
            productResponse.setReason(product.getReason());
            productResponse.setQuantity(product.getQuantity());
            productResponse.setWriteOffDate(product.getWriteOffDate());
            productResponse.setSupplierEmail(product.getSupplierEmail());
            productResponse.setItemId(product.getItem().getId());
            productResponse.setExpirationDate(product.getExpirationDate());
            productResponse.setConsumedQuantity(product.getConsumedQuantity());

            return productResponse;
        }).collect(Collectors.toList());
    }

    @Override
    public ProductResponse addProduct(AddProductRequest request) {
        var optionalItem = itemRepository.findById(request.getItemId());
        if (optionalItem.isEmpty()) {
            return null;
        }
        var item = optionalItem.get();
        var product = new Product();
        var numericBarcode = Integer.parseInt(request.getBarcode());
        int quantity = extractQuantityFromPackaging(item.getPackaging());
        product.setBarcode(numericBarcode);
        product.setItem(item);
        product.setQuantity(quantity);
        product.setSupplierEmail(null);
        product.setEntryDate(request.getEntryDate());
        product.setExpirationDate(request.getExpirationDate());

        try {
            var savedProduct = productRepository.save(product);
            item.setStockLevel(item.getStockLevel() + 1);
            itemRepository.save(item);

            var response = new ProductResponse();
            response.setBarcode(savedProduct.getBarcode());
            response.setEntryDate(savedProduct.getEntryDate());
            response.setExpirationDate(savedProduct.getExpirationDate());
            response.setQuantity(savedProduct.getQuantity());

            return response;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.err.println("Data Integrity Violation: " + e.getMessage());

            throw new BarcodeAlreadyExistsException("Barkod vec postoji!", e);

        } catch (Exception e) {
            throw new RuntimeException("Neuspelo dodavanje proizvoda zbog nepoznate greške.", e);
        }
    }

        private int extractQuantityFromPackaging(String packaging) {
            if (packaging == null) return 0;

            var pattern = Pattern.compile("(\\d+)(?=\\s*[a-zA-Z])");
            var matcher = pattern.matcher(packaging);

            if (matcher.find()) {
                try {
                    return Integer.parseInt(matcher.group(1));
                } catch (NumberFormatException e) {
                    return 0;
                }
            }
            return 0;
        }
}
