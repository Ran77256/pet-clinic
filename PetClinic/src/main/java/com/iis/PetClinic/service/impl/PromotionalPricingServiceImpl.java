package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.model.BenefitType;
import com.iis.PetClinic.model.PriceListItem;
import com.iis.PetClinic.model.Promotion;
import com.iis.PetClinic.model.Status;
import java.util.List;
import java.util.ArrayList;
import com.iis.PetClinic.repository.IPromotionRepository;
import com.iis.PetClinic.repository.IPriceListItemRepository;
import com.iis.PetClinic.service.IPromotionalPricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class PromotionalPricingServiceImpl implements IPromotionalPricingService {

    private final IPromotionRepository promotionRepository;
    private final IPriceListItemRepository priceListItemRepository;

    @Override
    public BigDecimal calculatePromotionalPrice(BigDecimal originalPrice, Long serviceId) {
        // Pronađi sve aktivne promocije za datu uslugu
        var promotions = promotionRepository.findAll().stream()
                .filter(p -> p.getStatus() == Status.ACTIVE)
                .filter(p -> p.getServices().stream().anyMatch(s -> s.getId().equals(serviceId)))
                .toList();

        // Ako nema aktivnih promocija, vrati originalnu cenu
        if (promotions.isEmpty()) {
            return originalPrice;
        }

        // Pronađi najbolju promociju za korisnika (najveći popust)
        BigDecimal bestPrice = originalPrice;
        for (Promotion promotion : promotions) {
            BigDecimal promotionalPrice = calculatePrice(originalPrice, promotion);
            if (promotionalPrice.compareTo(bestPrice) < 0) {
                bestPrice = promotionalPrice;
            }
        }

        return bestPrice;
    }

    private BigDecimal calculatePrice(BigDecimal originalPrice, Promotion promotion) {
        if (promotion.getBenefitType() == BenefitType.PERCENTAGE_DISCOUNT) {
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                promotion.getValue().divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
            );
            return originalPrice.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP);
        } else if (promotion.getBenefitType() == BenefitType.FIXED_AMOUNT_DISCOUNT) {
            return originalPrice.subtract(promotion.getValue()).max(BigDecimal.ZERO);
        }
        
        // Za ostale tipove promocija, vrati originalnu cenu
        return originalPrice;
    }

    @Override
    @Transactional
    public void applyPromotionToAllPriceLists(Long promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + promotionId));

        // Proveri da li je promocija aktivna
        if (promotion.getStatus() != Status.ACTIVE) {
            throw new RuntimeException("Cannot apply inactive promotion");
        }

        // Nađi sve stavke cenovnika za usluge na koje se odnosi promocija
        List<PriceListItem> items = new ArrayList<>();
        for (com.iis.PetClinic.model.Service service : promotion.getServices()) {
            items.addAll(priceListItemRepository.findAllByServiceId(service.getId()));
        }

        // Primeni promociju na svaku stavku
        for (PriceListItem item : items) {
            BigDecimal discountedPrice = calculatePrice(item.getPrice(), promotion);
            item.setPromotionalPrice(discountedPrice);
            priceListItemRepository.save(item);
        }
    }

    @Override
    @Transactional
    public void checkAndUpdatePromotionStatuses() {
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> promotions = promotionRepository.findAll();
        
        for (Promotion promotion : promotions) {
            // Aktiviraj promocije koje treba da počnu
            if (promotion.getStatus() == Status.PENDING && 
                promotion.getStartDate().isBefore(now)) {
                promotion.setStatus(Status.ACTIVE);
                promotionRepository.save(promotion);
                applyPromotionToAllPriceLists(promotion.getId());
            }
            
            // Deaktiviraj istekle promocije
            if (promotion.getStatus() == Status.ACTIVE && 
                promotion.getEndDate() != null && 
                promotion.getEndDate().isBefore(now)) {
                promotion.setStatus(Status.EXPIRED);
                promotionRepository.save(promotion);
                removePromotionFromPriceLists(promotion.getId());
            }
        }
    }

    @Override
    @Transactional
    public void removePromotionFromPriceLists(Long promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + promotionId));

        // Nađi sve stavke cenovnika za usluge na koje se odnosi promocija
        List<PriceListItem> items = new ArrayList<>();
        for (com.iis.PetClinic.model.Service service : promotion.getServices()) {
            items.addAll(priceListItemRepository.findAllByServiceId(service.getId()));
        }

        // Resetuj promotivne cene
        for (PriceListItem item : items) {
            item.setPromotionalPrice(null);
            priceListItemRepository.save(item);
        }
    }
}