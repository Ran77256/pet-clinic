package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.request.CreateOrderRequest;
import com.iis.PetClinic.dto.response.CreateOrderResponse;
import com.iis.PetClinic.dto.response.ItemOrderCountDTO;
import com.iis.PetClinic.model.Item;
import com.iis.PetClinic.model.Order;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IOrderService {
    ResponseEntity<String> createOrder(CreateOrderRequest orderRequest);
    List<CreateOrderResponse> getOrders();
    void simulateOrderArrival();
    List<ItemOrderCountDTO> findTop5OrderedItemsWithCount();
}
