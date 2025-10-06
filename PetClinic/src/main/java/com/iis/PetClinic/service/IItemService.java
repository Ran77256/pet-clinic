package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.response.ItemResponse;
import com.iis.PetClinic.model.Item;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IItemService {
    List<ItemResponse> getAllItemsForCategory(int categoryId);
    ItemResponse getItemById(int id);
}
