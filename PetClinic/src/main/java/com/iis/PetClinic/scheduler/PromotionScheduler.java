package com.iis.PetClinic.scheduler;

import com.iis.PetClinic.service.IPromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PromotionScheduler {

    private final IPromotionService promotionService;

    @Scheduled(fixedRate = 10000) // Izvršava se svakih 10 sekundi (za testiranje)
    public void updatePromotionStatuses() {
        System.out.println("\n=== SCHEDULER: Checking promotion statuses ===");
        promotionService.updatePromotionStatuses();
        System.out.println("=== SCHEDULER: Finished checking statuses ===\n");
    }
}