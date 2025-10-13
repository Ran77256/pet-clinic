package com.iis.PetClinic.dto.request;

import com.iis.PetClinic.dto.request.PriceListItemDTO;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceListDTO {

    private Long id;

    private String name; // npr. "Zimski cenovnik"

    private Integer version; // broj verzije (1,2,3,...)

    private String status; // DRAFT / ACTIVE / ARCHIVED (kao String radi jednostavnijeg prikaza)

    private LocalDateTime validFrom; // datum početka važenja

    private LocalDateTime validTo;   // datum isteka važenja (null = i dalje važi)

    private List<PriceListItemDTO> items; // stavke cenovnika
}
