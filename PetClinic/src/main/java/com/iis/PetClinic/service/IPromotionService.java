// com/iis/PetClinic/service/PromotionService.java
package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.response.PromotionDTO;
import com.iis.PetClinic.model.Promotion;

import java.util.List;
import java.util.Optional;

public interface IPromotionService {
    List<Promotion> getAllPromotions();
    Optional<Promotion> getPromotionById(Long id);
    Promotion addPromotion(Promotion promotion);
    Promotion updatePromotion(Long id, Promotion updatedPromotion);
    void deletePromotion(Long id);

    List<PromotionDTO> getAllPromotionDTOs();
    Promotion activatePromotion(Long id);
    Promotion deactivatePromotion(Long id);
    void updatePromotionStatuses();
    void applyPromotionToPriceLists(Long promotionId);
    void applyPromotionToAllPriceLists(Long promotionId);
    PromotionDTO convertToDTO(Promotion promotion);
}
