// com/iis/PetClinic/controller/PromotionController.java
package com.iis.PetClinic.controller;

import com.iis.PetClinic.model.Promotion;
import com.iis.PetClinic.dto.response.PromotionDTO;
import com.iis.PetClinic.service.IPromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final IPromotionService promotionService;

    @GetMapping("/all")
    public List<PromotionDTO> getAll() {
        return promotionService.getAllPromotions().stream().map(p -> PromotionDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .benefitType(p.getBenefitType().name())
                .status(p.getStatus().name())
                .clientType(p.getClientType().name())
                .serviceId(p.getService()!=null? p.getService().getId(): null)
                .serviceName(p.getService()!=null? p.getService().getName(): null)
                .animalTypeId(p.getAnimalType()!=null? p.getAnimalType().getId(): null)
                .animalTypeName(p.getAnimalType()!=null? p.getAnimalType().getName(): null)
                .value(p.getValue())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .build()).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionDTO> getById(@PathVariable Long id) {
    return promotionService.getPromotionById(id)
        .map(p -> PromotionDTO.builder()
            .id(p.getId())
            .name(p.getName())
            .benefitType(p.getBenefitType().name())
            .status(p.getStatus().name())
            .clientType(p.getClientType().name())
            .serviceId(p.getService()!=null? p.getService().getId(): null)
            .serviceName(p.getService()!=null? p.getService().getName(): null)
            .animalTypeId(p.getAnimalType()!=null? p.getAnimalType().getId(): null)
            .animalTypeName(p.getAnimalType()!=null? p.getAnimalType().getName(): null)
            .value(p.getValue())
            .startDate(p.getStartDate())
            .endDate(p.getEndDate())
            .build())
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(
            value = "/add",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )

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
