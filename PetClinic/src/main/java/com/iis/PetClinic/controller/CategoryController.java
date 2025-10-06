package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.response.CategoryResponse;
import com.iis.PetClinic.repository.ICategoryRepository;
import com.iis.PetClinic.service.ICategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CategoryController {

    @Autowired
    private ICategoryService categoryService;

    @GetMapping("/categories")
    public List<CategoryResponse> getAllCategories(){
        return categoryService.getAllCategories();
    }

}
