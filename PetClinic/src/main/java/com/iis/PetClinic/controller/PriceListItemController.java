package com.iis.PetClinic.controller;


import com.iis.PetClinic.dto.request.PriceListItemDTO;
import com.iis.PetClinic.model.PriceList;
import com.iis.PetClinic.model.PriceListItem;
import com.iis.PetClinic.repository.IClinicServiceRepository;
import com.iis.PetClinic.repository.IPriceListItemRepository;
import com.iis.PetClinic.repository.IPriceListRepository;
import com.iis.PetClinic.service.IPromotionalPricingService;

import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/price-list-items")
@CrossOrigin
@RequiredArgsConstructor
public class PriceListItemController {

    private final IPriceListItemRepository itemRepo;
    private final IPriceListRepository priceListRepo;
    private final IClinicServiceRepository serviceRepo;
    private final IPromotionalPricingService promotionalPricingService;

    // ------------------------------
    // 1️⃣ Dodavanje nove stavke (usluga + cena)
    // ------------------------------
    @PatchMapping("/sync-price")
    public ResponseEntity<?> synchronizePrices(
            @RequestParam Long serviceId,
            @RequestParam BigDecimal newPrice
    ) {
        List<PriceListItem> items = itemRepo.findAllByServiceId(serviceId);
        items.forEach(item -> {
            item.setPrice(newPrice);
            itemRepo.save(item);
        });
        return ResponseEntity.ok().build();
    }

    @PostMapping("/add")
    public ResponseEntity<PriceListItemDTO> addItem(
            @RequestParam Long priceListId,
            @RequestParam Long serviceId,
            @RequestParam BigDecimal price
    ) {
        PriceList priceList = priceListRepo.findById(priceListId)
                .orElseThrow(() -> new IllegalArgumentException("Price list not found: " + priceListId));

        com.iis.PetClinic.model.Service service = serviceRepo.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found: " + serviceId));

        // Check if item already exists for this service in this price list
        Optional<PriceListItem> existingItem = itemRepo.findByPriceListIdAndServiceId(priceListId, serviceId);
        
        PriceListItem saved;
        if (existingItem.isPresent()) {
            // Update existing item's price
            PriceListItem item = existingItem.get();
            item.setPrice(price);
            saved = itemRepo.save(item);
        } else {
            // Create new item
            PriceListItem newItem = PriceListItem.builder()
                    .priceList(priceList)
                    .service(service)
                    .price(price)
                    .build();
            saved = itemRepo.save(newItem);
        }

        PriceListItemDTO dto = PriceListItemDTO.builder()
                .id(saved.getId())
                .serviceId(saved.getService().getId())
                .serviceName(saved.getService().getName())
                .price(saved.getPrice())
                .build();

        return ResponseEntity.ok(dto);
    }

    // ------------------------------
    // 2️⃣ Dobijanje svih stavki za određeni cenovnik
    // ------------------------------
    @GetMapping("/by-pricelist/{priceListId}")
    public ResponseEntity<List<PriceListItemDTO>> getItemsByPriceList(@PathVariable Long priceListId) {
        List<PriceListItemDTO> items = itemRepo.findAll()
                .stream()
                .filter(i -> i.getPriceList().getId().equals(priceListId))
                .map(i -> PriceListItemDTO.builder()
                        .id(i.getId())
                        .serviceId(i.getService().getId())
                        .serviceName(i.getService().getName())
                        .price(i.getPrice())
                        .promotionalPrice(i.getPromotionalPrice())
                        .build())
                .toList();

        return ResponseEntity.ok(items);
    }

    // ------------------------------
    // 3️⃣ Ažuriranje cene stavke
    // ------------------------------
    @PutMapping("/{id}/update-price")
    public ResponseEntity<PriceListItemDTO> updateItemPrice(
            @PathVariable Long id,
            @RequestParam BigDecimal price
    ) {
        PriceListItem item = itemRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));

        item.setPrice(price);
        PriceListItem saved = itemRepo.save(item);

        PriceListItemDTO dto = PriceListItemDTO.builder()
                .id(saved.getId())
                .serviceId(saved.getService().getId())
                .serviceName(saved.getService().getName())
                .price(saved.getPrice())
                .build();

        return ResponseEntity.ok(dto);
    }

    // ------------------------------
    // 4️⃣ Brisanje stavke iz cenovnika
    // ------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        if (!itemRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        itemRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------
    // 5️⃣ Dobijanje svih stavki svih cenovnika
    // ------------------------------
    @GetMapping("/all")
    public ResponseEntity<List<PriceListItemDTO>> getAllItems() {
        List<PriceListItemDTO> items = itemRepo.findAll()
                .stream()
                .map(i -> PriceListItemDTO.builder()
                        .id(i.getId())
                        .serviceId(i.getService().getId())
                        .serviceName(i.getService().getName())
                        .price(i.getPrice())
                        .build())
                .toList();

        return ResponseEntity.ok(items);
    }
}
