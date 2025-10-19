package com.iis.PetClinic.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WriteOffDTO {

    private String itemName;
    private Long writeOffCount;
}
