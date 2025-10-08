package com.iis.PetClinic.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data @AllArgsConstructor
public class AppointmentSummaryDTO {
    private Long id;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String status;
    private boolean urgent;
    private Integer vetId;
    private String vetName;
    private Long petId;
    private String petName;
    private Long serviceId;
    private String serviceName;
}