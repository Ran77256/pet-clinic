package com.iis.PetClinic.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PromotionDTO {
    private Long id;
    private String name;
    private String benefitType;   // enum → String
    private String status;        // enum → String
    private String clientType;    // enum → String

    private Long serviceId;
    private String serviceName;

    private Long animalTypeId;
    private String animalTypeName;

    private BigDecimal value;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Long priceListId;
    private String priceListName;     // opcionalno, ako PriceList ima name
    private String priceListStatus;   // npr. DRAFT/ACTIVE/ARCHIVED (ako postoji enum)
}
