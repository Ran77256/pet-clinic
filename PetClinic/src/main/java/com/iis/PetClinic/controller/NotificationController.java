package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.response.NotificationResponse;
import com.iis.PetClinic.repository.INotificationRepository;
import com.iis.PetClinic.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NotificationController {

    @Autowired
    private INotificationService notificationService;

    @GetMapping("/notifications")
    public List<NotificationResponse> findAll(){
        return notificationService.findAll();
    }
}
