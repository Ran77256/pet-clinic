package com.iis.PetClinic.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceListDTO {

    private Long id;

    private Long serviceId; // umesto celog objekta Service, samo ID

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private BigDecimal price;
}
