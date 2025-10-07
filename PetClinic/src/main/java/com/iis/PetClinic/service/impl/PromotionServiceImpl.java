// com/iis/PetClinic/service/impl/PromotionServiceImpl.java
package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.model.Promotion;
import com.iis.PetClinic.repository.IPromotionRepository;

import com.iis.PetClinic.service.IPromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements IPromotionService {

    private final IPromotionRepository repo;

    @Override
    public List<Promotion> getAllPromotions() {
        return repo.findAll();
    }

    @Override
    public Optional<Promotion> getPromotionById(Long id) {
        return repo.findById(id);
    }

    @Override
    public Promotion addPromotion(Promotion promotion) {
        return repo.save(promotion);
    }

    @Override
    public Promotion updatePromotion(Long id, Promotion updatedPromotion) {
        return repo.findById(id)
                .map(existing -> {
                    existing.setName(updatedPromotion.getName());
                    existing.setBenefitType(updatedPromotion.getBenefitType());
                    existing.setClientType(updatedPromotion.getClientType());
                    existing.setService(updatedPromotion.getService());
                    existing.setAnimalType(updatedPromotion.getAnimalType());
                    existing.setValue(updatedPromotion.getValue());
                    existing.setStartDate(updatedPromotion.getStartDate());
                    existing.setEndDate(updatedPromotion.getEndDate());
                    return repo.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Promotion not found with id " + id));
    }

    @Override
    public void deletePromotion(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Promotion not found with id " + id);
        }
        repo.deleteById(id);
    }
}
