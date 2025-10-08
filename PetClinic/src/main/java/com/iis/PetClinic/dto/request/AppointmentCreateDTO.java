package com.iis.PetClinic.dto.request;

import java.time.LocalDateTime;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentCreateDTO {
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private boolean urgent;
    private String priority;       // H1/H2/H3 (opciono)
    private Integer veterinarianId;
    private Long petId;
    private Long serviceId;
    private Long createdById;      // ko je uneo (STAFF_ADMIN), opciono
    private String note;
}
