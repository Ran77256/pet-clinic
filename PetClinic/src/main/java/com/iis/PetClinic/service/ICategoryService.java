package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.response.CategoryResponse;
import com.iis.PetClinic.model.Category;

import java.util.List;

public interface ICategoryService {
    List<CategoryResponse> getAllCategories();
}
