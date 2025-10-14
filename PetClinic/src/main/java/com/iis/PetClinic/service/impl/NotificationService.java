package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.response.NotificationResponse;
import com.iis.PetClinic.repository.INotificationRepository;
import com.iis.PetClinic.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationService implements INotificationService {

    @Autowired
    private INotificationRepository notificationRepository;

    @Override
    public String createNotificationDescription(String itemName, String categoryName, int barcode, LocalDate writeOffDate){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String formattedDate = writeOffDate.format(formatter);

        return String.format(
                "Otpisana roba: Otpisan/a %s iz kategorije %s sa barkodom %d. Datum otpisa %s.%n",
                itemName,
                categoryName,
                barcode,
                formattedDate
        );
    }

    @Override
    public List<NotificationResponse> findAll(){
        var notifications = notificationRepository.findAll();
        return notifications.stream().map(notification -> {
            var response = new NotificationResponse();
            response.setId(notification.getId());
            response.setDescription(notification.getDescription());
            response.setStatus(notification.getStatus());
            response.setCreatedAt(notification.getCreatedAt());
            response.setType(notification.getType());

            return response;
        }).toList();
    }

    @Override
    public String createOrderArrivalDescription(int orderId, String itemName) {
        String template = "Narudžbina %d za stavku %s je stigla u ambulantu";

        return String.format(template, orderId, itemName);
    }

    @Override
    public String createLowStockOrderNotification(String itemName, String categoryName) {
        String template = "Stavka %s iz kategorije %s je pred kraj zaliha. Nova narudžbina je automatski kreirana.";

        return String.format(template, itemName, categoryName);
    }
}
