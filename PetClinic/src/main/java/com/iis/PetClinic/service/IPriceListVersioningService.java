package com.iis.PetClinic.service;

import com.iis.PetClinic.model.PriceList;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface IPriceListVersioningService {

    /**
     * Kreira DRAFT verziju kloniranjem trenutno ACTIVE cenovnika.
     * @param nameForDraft opcioni naziv za novi draft (ako je null, preuzima se naziv od aktivnog)
     */
    PriceList createDraftFromActive(String nameForDraft);

    /**
     * Objavljuje DRAFT verziju od prosleđenog datuma,
     * prethodnu ACTIVE verziju arhivira (validTo = effectiveFrom - 1s).
     */
    PriceList publishDraft(Long draftId, LocalDateTime effectiveFrom);

    /**
     * Vraća cenu konkretne usluge koja važi u trenutku 'at'.
     */
    BigDecimal getPriceAt(Long serviceId, LocalDateTime at);
}
