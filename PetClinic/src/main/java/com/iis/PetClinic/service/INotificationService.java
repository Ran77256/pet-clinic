package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.response.NotificationResponse;

import java.time.LocalDate;
import java.util.List;

public interface INotificationService {
    String createNotificationDescription(String itemName, String categoryName, int barcode, LocalDate writeOffDate);
    List<NotificationResponse> findAll();
    String createOrderArrivalDescription(int orderId, String itemName);
    String createLowStockOrderNotification(String itemName, String categoryName);
}
