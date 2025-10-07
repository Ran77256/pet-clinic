// com/iis/PetClinic/service/impl/PriceListServiceImpl.java
package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.model.PriceList;
import com.iis.PetClinic.repository.IPriceListRepository;
import com.iis.PetClinic.service.IPriceListService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PriceListServiceImpl implements IPriceListService {
    private final IPriceListRepository repo;

    @Override public PriceList create(PriceList p) { return repo.save(p); }
    @Override public List<PriceList> findAll() { return repo.findAll(); }
    @Override public Optional<PriceList> findById(Long id) { return repo.findById(id); }

    @Override
    public PriceList update(Long id, PriceList p) {
        PriceList existing = repo.findById(id).orElseThrow();
        existing.setService(p.getService());
        existing.setStartDate(p.getStartDate());
        existing.setEndDate(p.getEndDate());
        existing.setPrice(p.getPrice());
        return repo.save(existing);
    }

    @Override public void delete(Long id) { repo.deleteById(id); }
}
