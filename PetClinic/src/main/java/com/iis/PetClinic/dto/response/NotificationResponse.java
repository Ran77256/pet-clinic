package com.iis.PetClinic.dto.response;

import com.iis.PetClinic.model.NotificationStatus;
import com.iis.PetClinic.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private int id;
    private String description;
    private LocalDate createdAt;
    private NotificationStatus status;
    private NotificationType type;
}
