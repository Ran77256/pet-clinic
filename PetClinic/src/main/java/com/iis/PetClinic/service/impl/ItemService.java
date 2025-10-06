package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.response.ItemResponse;
import com.iis.PetClinic.model.Item;
import com.iis.PetClinic.repository.ICategoryRepository;
import com.iis.PetClinic.repository.IItemRepository;
import com.iis.PetClinic.service.IItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService implements IItemService {

    @Autowired
    private IItemRepository itemRepository;

    @Autowired
    private ICategoryRepository categoryRepository;

    @Override
    public List<ItemResponse> getAllItemsForCategory(int categoryId){

        var category = categoryRepository.findById(categoryId);
        if(category.isEmpty()){
            return null;
        }

        var items = itemRepository.findAllByCategory_Id(categoryId);
        return items.stream().map(item -> {
        var response = new ItemResponse();
        response.setId(item.getId());
        response.setName(item.getName());
        response.setMinQuantity(item.getMinQuantity());
        response.setStockLevel(item.getStockLevel());

        return response;
    })
            .collect(Collectors.toList());
    }

    public ItemResponse getItemById(int id){
        var optionalItem = itemRepository.findById(id);

        if(optionalItem.isEmpty()){
            return null;
        }
        var item = optionalItem.get();
        var response = new ItemResponse();
        response.setId(item.getId());
        response.setName(item.getName());
        response.setMinQuantity(item.getMinQuantity());
        response.setStockLevel(item.getStockLevel());
        response.setPackaging(item.getPackaging());

        return response;
    }
}
