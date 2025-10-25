package com.iis.PetClinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionDTO {
    private Long id;
    private String name;
    private String benefitType;
    private String status;
    private String clientType;

    private Long serviceId;
    private String serviceName;

    private Long animalTypeId;
    private String animalTypeName;

    private BigDecimal value;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
