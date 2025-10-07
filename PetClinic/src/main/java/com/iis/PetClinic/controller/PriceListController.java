// com/iis/PetClinic/controller/PriceListController.java
package com.iis.PetClinic.controller;

import com.iis.PetClinic.model.PriceList;
import com.iis.PetClinic.service.IPriceListService;
import com.iis.PetClinic.service.impl.PriceListServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pricelists")
@RequiredArgsConstructor
public class PriceListController {

    private final PriceListServiceImpl service;

    @GetMapping("/all")
    public List<PriceList> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PriceList> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public PriceList add(@RequestBody PriceList priceList) {
        return service.create(priceList);
    }

    @PutMapping("/update/{id}")
    public PriceList update(@PathVariable Long id, @RequestBody PriceList updated) {
        return service.update(id, updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
