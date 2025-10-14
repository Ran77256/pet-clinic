package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface INotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findAll();
}
