package com.iis.PetClinic.dto.projection;

import java.time.LocalDate;

public interface ExpirationRiskProjection {
    String getItemName();
    LocalDate getExpirationDate();
}
