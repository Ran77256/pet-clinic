// com/iis/PetClinic/controller/PromotionController.java
package com.iis.PetClinic.controller;

import com.iis.PetClinic.model.Promotion;
import com.iis.PetClinic.service.IPromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final IPromotionService promotionService;

    @GetMapping("/all")
    public List<Promotion> getAll() {
        return promotionService.getAllPromotions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getById(@PathVariable Long id) {
        return promotionService.getPromotionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public Promotion add(@RequestBody Promotion promotion) {
        return promotionService.addPromotion(promotion);
    }

    @PutMapping("/update/{id}")
    public Promotion update(@PathVariable Long id, @RequestBody Promotion updatedPromotion) {
        return promotionService.updatePromotion(id, updatedPromotion);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }
}
