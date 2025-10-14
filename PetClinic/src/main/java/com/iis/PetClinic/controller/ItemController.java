package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.CreateItemRequest;
import com.iis.PetClinic.dto.request.EditItemRequest;
import com.iis.PetClinic.dto.response.ItemResponse;
import com.iis.PetClinic.model.Item;
import com.iis.PetClinic.service.IItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ItemController {

    @Autowired
    private IItemService itemService;
    @Autowired
    private com.iis.PetClinic.repository.IItemRepository itemRepository;

    @GetMapping("/items/{categoryId}")
    public List<ItemResponse> getAllItemsForCategory(@PathVariable int categoryId){
        return itemService.getAllItemsForCategory(categoryId);
    }

    @GetMapping("/item/{itemId}")
    public ItemResponse getItemById(@PathVariable int itemId){
        return itemService.getItemById(itemId);
    }

    @GetMapping("/items/lekovi")
    public List<Item> getLekovi() {
        return itemRepository.findByCategory_Id(1);
    }

    @GetMapping("/items/hrana")
    public List<Item> getHrana() {
        return itemRepository.findByCategory_Id(2);
    }

    @PutMapping("/items/edit")
    public ResponseEntity<String> editItem(@RequestBody EditItemRequest request){
        return itemService.editItem(request);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<String> deleteItem(@PathVariable int itemId) {
        return itemService.deleteItem(itemId);
    }

    @PostMapping("/items")
    public ResponseEntity<Item> createItem(@RequestBody CreateItemRequest request) {
        return itemService.createNewItem(request);
    }
}
