package com.iis.PetClinic.service;

import java.math.BigDecimal;

public interface IPromotionalPricingService {
    BigDecimal calculatePromotionalPrice(BigDecimal originalPrice, Long serviceId);
    void applyPromotionToAllPriceLists(Long promotionId);
    void checkAndUpdatePromotionStatuses();
    void removePromotionFromPriceLists(Long promotionId);
}