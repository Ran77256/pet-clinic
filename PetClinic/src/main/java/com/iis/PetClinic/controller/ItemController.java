package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.response.ItemResponse;
import com.iis.PetClinic.model.Item;
import com.iis.PetClinic.service.IItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ItemController {

    @Autowired
    private IItemService itemService;

    @GetMapping("/items/{categoryId}")
    public List<ItemResponse> getAllItemsForCategory(@PathVariable int categoryId){
        return itemService.getAllItemsForCategory(categoryId);
    }

    @GetMapping("/item/{itemId}")
    public ItemResponse getItemById(@PathVariable int itemId){
        return itemService.getItemById(itemId);
    }
}
