package com.iis.PetClinic.dto.request;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceListItemDTO {

    private Long id;

    private Long serviceId; // ID usluge

    private String serviceName; // naziv usluge (za prikaz)

    private BigDecimal price; // cena u RSD
}
