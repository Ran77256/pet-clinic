// com/iis/PetClinic/service/PriceListService.java
package com.iis.PetClinic.service;

import com.iis.PetClinic.model.PriceList;
import java.util.List;
import java.util.Optional;

public interface IPriceListService {
    PriceList create(PriceList p);
    List<PriceList> findAll();
    Optional<PriceList> findById(Long id);
    PriceList update(Long id, PriceList p);
    void delete(Long id);
}
