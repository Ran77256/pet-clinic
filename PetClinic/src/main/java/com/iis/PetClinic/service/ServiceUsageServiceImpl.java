package com.iis.PetClinic.service;

import com.iis.PetClinic.model.Promotion;
import com.iis.PetClinic.model.ServiceUsage;
import com.iis.PetClinic.repository.IServiceUsageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceUsageServiceImpl implements IServiceUsageService {

    private final IServiceUsageRepository repository;

    public ServiceUsageServiceImpl(IServiceUsageRepository repository) {
        this.repository = repository;
    }

    @Override
    public ServiceUsage record(ServiceUsage usage) {
        return repository.save(usage);
    }

    @Override
    public List<ServiceUsage> getUsagesForPromotion(Promotion promotion) {
        return repository.findByPromotion(promotion);
    }

    @Override
    public List<ServiceUsage> getUsagesForPromotionAndPeriod(Promotion promotion, LocalDateTime from, LocalDateTime to) {
        return repository.findByPromotionAndPeriod(promotion, from, to);
    }
}
