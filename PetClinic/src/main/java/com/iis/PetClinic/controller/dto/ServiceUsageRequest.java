package com.iis.PetClinic.controller.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ServiceUsageRequest {
    private Long serviceId;
    private Long promotionId;
    private Long petId;
    private Integer performedById; // matches User id type in repository
    private LocalDateTime usageDate;
    private BigDecimal pricePaid;
    private BigDecimal savings;
}
