package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.PriceListItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IPriceListItemRepository extends JpaRepository<PriceListItem, Long> {
    Optional<PriceListItem> findByPriceListIdAndServiceId(Long priceListId, Long serviceId);
}
