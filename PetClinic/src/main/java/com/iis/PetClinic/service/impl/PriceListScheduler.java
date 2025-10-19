package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.model.PriceList;
import com.iis.PetClinic.model.PriceListStatus;
import com.iis.PetClinic.repository.IPriceListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PriceListScheduler {

    private final IPriceListRepository priceListRepository;
    private final PriceListVersioningService versioningService;

    @Scheduled(fixedDelay = 10000) // Run every 10 seconds
    @Transactional
    public void checkAndActivatePriceLists() {
        LocalDateTime now = LocalDateTime.now();

        // Get all pending price lists that should be activated now
        List<PriceList> pendingPriceLists = priceListRepository.findByStatusAndValidFromLessThanEqual(
            PriceListStatus.PENDING,
            now
        );

        for (PriceList priceList : pendingPriceLists) {
            try {
                // Archive current active price list if exists
                PriceList currentActive = priceListRepository.findFirstByStatus(PriceListStatus.ACTIVE)
                    .orElse(null);

                if (currentActive != null) {
                    currentActive.setStatus(PriceListStatus.ARCHIVED);
                    currentActive.setValidTo(priceList.getValidFrom().minusSeconds(1));
                    priceListRepository.save(currentActive);
                }

                // Activate the pending price list
                priceList.setStatus(PriceListStatus.ACTIVE);
                priceListRepository.save(priceList);

            } catch (Exception e) {
                // Log error but continue with other price lists
                System.err.println("Error activating price list " + priceList.getId() + ": " + e.getMessage());
            }
        }

        // Check for expired active price lists
        List<PriceList> activePriceLists = priceListRepository.findByStatus(PriceListStatus.ACTIVE);
        for (PriceList activeList : activePriceLists) {
            if (activeList.getValidTo() != null && now.isAfter(activeList.getValidTo())) {
                activeList.setStatus(PriceListStatus.ARCHIVED);
                priceListRepository.save(activeList);
            }
        }
    }
}