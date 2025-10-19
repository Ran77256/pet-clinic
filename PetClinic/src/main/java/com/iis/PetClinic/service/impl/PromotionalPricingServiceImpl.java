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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PromotionalPricingServiceImpl implements IPromotionalPricingService {

    private final IPromotionRepository promotionRepository;
    private final IPriceListItemRepository priceListItemRepository;

    @Override
    public BigDecimal calculatePromotionalPrice(BigDecimal originalPrice, Long serviceId) {
        // Pronađi sve aktivne promocije za datu uslugu
        LocalDateTime now = LocalDateTime.now();
        var promotions = promotionRepository.findAll().stream()
                .filter(p -> p.getStatus() == Status.ACTIVE)
                .filter(p -> p.getServices().stream().anyMatch(s -> s.getId().equals(serviceId)))
                .filter(p -> p.getStartDate().isBefore(now) && 
                           (p.getEndDate() == null || p.getEndDate().isAfter(now)))
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

        System.out.println("Applying promotion: " + promotion.getName() + " (ID: " + promotion.getId() + ")");
        System.out.println("Current status: " + promotion.getStatus());
        
        // Za svaku uslugu na koju se odnosi promocija
        for (com.iis.PetClinic.model.Service service : promotion.getServices()) {
            System.out.println("Processing service: " + service.getName() + " (ID: " + service.getId() + ")");
            
            // Nađi sve stavke cenovnika za tu uslugu
            List<PriceListItem> items = priceListItemRepository.findAllByServiceId(service.getId());
            System.out.println("Found " + items.size() + " price list items for service");
            
            // Za svaku stavku cenovnika izračunaj najbolju cenu uzimajući u obzir SVE aktivne promocije
            for (PriceListItem item : items) {
                BigDecimal originalPrice = item.getPrice();
                BigDecimal currentPromotionalPrice = item.getPromotionalPrice();
                
                // calculatePromotionalPrice će uzeti u obzir sve aktivne promocije, uključujući i novu
                BigDecimal bestPrice = calculatePromotionalPrice(originalPrice, service.getId());
                
                System.out.println("Price list item ID: " + item.getId());
                System.out.println("  Original price: " + originalPrice);
                System.out.println("  Current promotional price: " + currentPromotionalPrice);
                System.out.println("  New calculated price: " + bestPrice);
                
                // Primeni novu cenu samo ako je bolja od trenutne
                if (currentPromotionalPrice == null || bestPrice.compareTo(currentPromotionalPrice) < 0) {
                    System.out.println("  -> Updating promotional price to: " + bestPrice);
                    item.setPromotionalPrice(bestPrice);
                    priceListItemRepository.save(item);
                } else {
                    System.out.println("  -> Keeping current promotional price");
                }
            }
        }
    }

    @Override
    @Transactional
    public void checkAndUpdatePromotionStatuses() {
        // This has been moved to PromotionService to consolidate status management logic
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

        // Za svaku stavku, rekalkuliši cenu sa preostalim aktivnim promocijama
        for (PriceListItem item : items) {
            // calculatePromotionalPrice će uzeti u obzir sve preostale aktivne promocije
            BigDecimal newPrice = calculatePromotionalPrice(item.getPrice(), item.getService().getId());
            // Ako ima drugih aktivnih promocija, postavi novu cenu, inače postavi null
            if (newPrice.compareTo(item.getPrice()) < 0) {
                item.setPromotionalPrice(newPrice);
            } else {
                item.setPromotionalPrice(null);
            }
            priceListItemRepository.save(item);
        }
    }
}