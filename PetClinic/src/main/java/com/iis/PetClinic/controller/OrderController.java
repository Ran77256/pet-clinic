package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.CreateOrderRequest;
import com.iis.PetClinic.dto.response.CreateOrderResponse;
import com.iis.PetClinic.dto.response.ItemOrderCountDTO;
import com.iis.PetClinic.service.IOrderService;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@NoArgsConstructor
public class OrderController {

    @Autowired
    private IOrderService orderService;

    @PostMapping("/createorder")
    public ResponseEntity<String> createOrder(@RequestBody CreateOrderRequest orderRequest){
        return orderService.createOrder(orderRequest);
    }

    @GetMapping("/orders")
    public List<CreateOrderResponse> getOrders(){
        return orderService.getOrders();
    }

    @GetMapping("/topordered")
    public List<ItemOrderCountDTO> getTop5OrderedItems(){
        return orderService.findTop5OrderedItemsWithCount();
    }
}
