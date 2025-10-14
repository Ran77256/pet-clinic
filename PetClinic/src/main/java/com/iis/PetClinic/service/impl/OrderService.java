package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.request.CreateOrderRequest;
import com.iis.PetClinic.dto.response.CreateOrderResponse;
import com.iis.PetClinic.model.*;
import com.iis.PetClinic.repository.IItemRepository;
import com.iis.PetClinic.repository.IOrderRepository;
import com.iis.PetClinic.service.IOrderService;
import com.iis.PetClinic.service.IProductService;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@NoArgsConstructor
public class OrderService implements IOrderService {

    @Autowired
    private IItemRepository itemRepository;

    @Autowired
    private IOrderRepository orderRepository;

    @Autowired
    private IProductService productService;

    @Override
    public ResponseEntity<String> createOrder(CreateOrderRequest orderRequest){
        var optionalItem = itemRepository.findById(orderRequest.getItemId());
        if(optionalItem.isEmpty()){
            return new ResponseEntity<String>("Stavka ne postoji!",HttpStatus.NOT_FOUND);
        }

        var item = optionalItem.get();
        var order = new Order();
        order.setItem(item);
        order.setCreationDate(LocalDateTime.now());
        order.setQuantity(orderRequest.getQuantity());
        order.setEmail(orderRequest.getEmail());
        order.setType(CreationType.MANUAL);
        order.setStatus(Status.CREATED);

        try{
            orderRepository.save(order);
            return new ResponseEntity<>("Narudzbina uspesno kreirana!", HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<CreateOrderResponse> getOrders(){
        var orders =  orderRepository.findAll();

        if(orders.isEmpty()){
            return null;
        }

        return orders.stream().map(order -> {
            var orderResponse = new CreateOrderResponse();
            orderResponse.setId(order.getId());
            orderResponse.setItemName(order.getItem().getName());
            orderResponse.setStatus(order.getStatus().toString());
            orderResponse.setType(order.getType().toString());
            orderResponse.setQuantity(order.getQuantity());
            orderResponse.setEmail(order.getEmail());
            orderResponse.setCreationDate(order.getCreationDate());

            return orderResponse;
        }).collect(Collectors.toList());
    }

    @Override
    @Scheduled(cron = "0 18 17 * * ?")
    @Transactional
    public void simulateOrderArrival(){
        var orders = orderRepository.findAll();
        for(Order order: orders){
            if(order.getCreationDate().isBefore(LocalDateTime.now().minusHours(1))){
                productService.updateProductsAfterOrder(order);
                order.setStatus(Status.RECEIVED);
            }
        }
    }
}
