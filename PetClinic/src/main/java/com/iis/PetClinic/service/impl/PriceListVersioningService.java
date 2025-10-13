package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.model.PriceList;
import com.iis.PetClinic.model.PriceListItem;
import com.iis.PetClinic.model.PriceListStatus;
import com.iis.PetClinic.repository.IPriceListItemRepository;
import com.iis.PetClinic.repository.IPriceListRepository;
import com.iis.PetClinic.service.IPriceListVersioningService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PriceListVersioningService implements IPriceListVersioningService {

    private final IPriceListRepository priceListRepo;
    private final IPriceListItemRepository itemRepo;

    @Override
    @Transactional
    public PriceList createDraftFromActive(String nameForDraft) {
        PriceList active = priceListRepo.findFirstByStatusOrderByVersionDesc(PriceListStatus.ACTIVE)
                .orElseThrow(() -> new IllegalStateException("No ACTIVE price list"));

        PriceList draft = PriceList.builder()
                .name(nameForDraft != null && !nameForDraft.isBlank() ? nameForDraft : active.getName())
                .version(active.getVersion() + 1)
                .status(PriceListStatus.DRAFT)
                // validFrom za draft može ostati privremeno; postavlja se pri publish-u,
                // ili možeš inicijalno preuzeti aktivni.validTo + 1s ako ti tako odgovara:
                .validFrom(active.getValidTo() != null ? active.getValidTo().plusSeconds(1) : active.getValidFrom())
                .build();

        draft = priceListRepo.save(draft);

        // kopiraj sve stavke iz ACTIVE u novi DRAFT
        for (PriceListItem it : active.getItems()) {
            PriceListItem copy = PriceListItem.builder()
                    .priceList(draft)
                    .service(it.getService())
                    .price(it.getPrice())
                    .build();
            itemRepo.save(copy);
        }
        return draft;
    }

    @Override
    @Transactional
    public PriceList publishDraft(Long draftId, LocalDateTime effectiveFrom) {
        if (effectiveFrom == null) {
            throw new IllegalArgumentException("effectiveFrom must not be null");
        }

        PriceList draft = priceListRepo.findById(draftId)
                .orElseThrow(() -> new IllegalArgumentException("Draft not found: " + draftId));

        if (draft.getStatus() != PriceListStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT can be published.");
        }

        // zatvori prethodni ACTIVE (ako postoji)
        PriceList prevActive = priceListRepo.findFirstByStatusOrderByVersionDesc(PriceListStatus.ACTIVE).orElse(null);
        if (prevActive != null) {
            prevActive.setStatus(PriceListStatus.ARCHIVED);
            prevActive.setValidTo(effectiveFrom.minusSeconds(1));
            priceListRepo.save(prevActive);
        }

        // objavi draft
        draft.setStatus(PriceListStatus.ACTIVE);
        draft.setValidFrom(effectiveFrom);
        priceListRepo.save(draft);

        return draft;
    }

    @Override
    public BigDecimal getPriceAt(Long serviceId, LocalDateTime at) {
        PriceList pl = priceListRepo.findActiveAt(at)
                .orElseThrow(() -> new IllegalStateException("No active price list at " + at));

        return itemRepo.findByPriceListIdAndServiceId(pl.getId(), serviceId)
                .map(PriceListItem::getPrice)
                .orElseThrow(() -> new IllegalStateException(
                        "Service " + serviceId + " is not priced in the active price list at " + at));
    }

}

