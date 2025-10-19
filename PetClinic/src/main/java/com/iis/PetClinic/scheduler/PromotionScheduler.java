package com.iis.PetClinic.scheduler;

import com.iis.PetClinic.service.IPromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PromotionScheduler {

    private final IPromotionService promotionService;

    @Scheduled(cron = "0 0 * * * *") // Izvršava se na početku svakog sata
    public void updatePromotionStatuses() {
        promotionService.updatePromotionStatuses();
    }
}