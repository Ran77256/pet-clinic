package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.response.CategoryResponse;
import com.iis.PetClinic.repository.ICategoryRepository;
import com.iis.PetClinic.service.ICategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService implements ICategoryService {

    @Autowired
    private ICategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllCategories(){
        var categories = categoryRepository.findAll();
        if(categories.isEmpty()){
            return null;
        }

        return categories.stream().map(category -> {
            var categoryResponse = new CategoryResponse();
            categoryResponse.setId(category.getId());
            categoryResponse.setName(category.getName());
            return categoryResponse;
        }).collect(Collectors.toList());
    }
}
