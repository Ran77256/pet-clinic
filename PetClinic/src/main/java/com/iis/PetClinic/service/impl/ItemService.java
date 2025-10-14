package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.request.CreateItemRequest;
import com.iis.PetClinic.dto.request.EditItemRequest;
import com.iis.PetClinic.dto.response.ItemResponse;
import com.iis.PetClinic.model.*;
import com.iis.PetClinic.repository.*;
import com.iis.PetClinic.service.IItemService;
import com.iis.PetClinic.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService implements IItemService {

    @Autowired
    private IItemRepository itemRepository;

    @Autowired
    private ICategoryRepository categoryRepository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private INotificationRepository notificationRepository;

    @Autowired
    private IOrderRepository orderRepository;

    @Autowired
    private IProductRepository productRepository;

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

    @Override
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

    @Override
    @Transactional
    @Scheduled(cron = "0 17 17 * * ?")
    public void detectLowSupplies(){
        var items = itemRepository.findAll();
        for(Item item: items){
            if(item.getStockLevel() < item.getMinQuantity()){
                var description = notificationService.createLowStockOrderNotification(item.getName(), item.getCategory().getName());
                var notification = new Notification();
                notification.setDescription(description);
                notification.setStatus(NotificationStatus.UNREAD);
                notification.setType(NotificationType.LOW_STOCK_ITEM);
                notification.setCreatedAt(LocalDate.now());
                notificationRepository.save(notification);

                var order = new Order();
                order.setItem(item);
                order.setQuantity(10);
                order.setCreationDate(LocalDateTime.now());
                order.setStatus(Status.CREATED);
                order.setType(CreationType.AUTO);
                var products = productRepository.findAllByItem_Id(item.getId());
                var email = products.stream()
                        .map(Product::getSupplierEmail)
                        .findFirst()
                        .orElse(null);
                order.setEmail(email == null ? "oders@gmail.com" : email);  //Ako ne postoji product za dati item, onda stavljamo genericki mejl, u suprotnom mejl od prvog pronadjenog produkta

                orderRepository.save(order);
            }
        }
    }

    @Override
    public ResponseEntity<String> editItem(EditItemRequest request) {

        var optionalItem = itemRepository.findById(request.getId());
        if(optionalItem.isEmpty()){
             return new ResponseEntity<>("Stavka ne postoji!", HttpStatus.NOT_FOUND);
        }
        var item = optionalItem.get();
        item.setName(request.getName());
        item.setMinQuantity(request.getMinQuantity());
        itemRepository.save(item);

        return new ResponseEntity<>("Stavka uspešno ažurirana.", HttpStatus.OK);
    }

    @Transactional
    @Override
    public ResponseEntity<String> deleteItem(int itemId) {
        if (!itemRepository.existsById(itemId)) {
            return new ResponseEntity<>("Stavka sa ID-em " + itemId + " ne postoji.", HttpStatus.NOT_FOUND);
        }
        try {
            productRepository.deleteAllByItem_Id(itemId);
            itemRepository.deleteById(itemId);
            return new ResponseEntity<>("Stavka i svi povezani proizvodi su obrisani.", HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            System.err.println("Greška prilikom brisanja stavke sa ID-em " + itemId + ": " + e.getMessage());
            return new ResponseEntity<>("Interna greška prilikom brisanja.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ResponseEntity<Item> createNewItem(CreateItemRequest request) {

        var optionalCategory = categoryRepository.findById(request.getCategoryId());
        if (optionalCategory.isEmpty()) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }

        var category = optionalCategory.get();

        var newItem = new Item();
        newItem.setName(request.getName());
        newItem.setPackaging(request.getPackaging());
        newItem.setMinQuantity(request.getMinQuantity());
        newItem.setCategory(category);
        newItem.setStockLevel(0);

        try {
            var savedItem = itemRepository.save(newItem);
            return new ResponseEntity<>(savedItem, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Greška prilikom kreiranja stavke: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
