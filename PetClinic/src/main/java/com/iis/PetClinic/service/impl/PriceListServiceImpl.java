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
    public PriceList update(Long id, PriceList updated) {
        PriceList existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Price list not found with ID: " + id));

        // Ažuriramo osnovne podatke o cenovniku
        existing.setName(updated.getName());
        existing.setVersion(updated.getVersion());
        existing.setStatus(updated.getStatus());
        existing.setValidFrom(updated.getValidFrom());
        existing.setValidTo(updated.getValidTo());

        // Ako korisnik menja i stavke (npr. cene usluga)
        if (updated.getItems() != null) {
            existing.getItems().clear();
            updated.getItems().forEach(item -> {
                item.setPriceList(existing); // poveži nazad roditelja
                existing.getItems().add(item);
            });
        }

        return repo.save(existing);
    }


    @Override public void delete(Long id) { repo.deleteById(id); }
}
