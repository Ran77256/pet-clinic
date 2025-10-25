package com.iis.PetClinic.service;

import com.iis.PetClinic.model.Promotion;
import com.iis.PetClinic.model.ServiceUsage;

import java.time.LocalDateTime;
import java.util.List;

public interface IServiceUsageService {
    ServiceUsage record(ServiceUsage usage);
    List<ServiceUsage> getUsagesForPromotion(Promotion promotion);
    List<ServiceUsage> getUsagesForPromotionAndPeriod(Promotion promotion, LocalDateTime from, LocalDateTime to);
}
