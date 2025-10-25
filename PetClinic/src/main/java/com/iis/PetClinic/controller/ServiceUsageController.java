package com.iis.PetClinic.controller;

import com.iis.PetClinic.model.Promotion;
import com.iis.PetClinic.model.ServiceUsage;
import com.iis.PetClinic.repository.IPromotionRepository;
import com.iis.PetClinic.repository.IClinicServiceRepository;
import com.iis.PetClinic.repository.IPetRepository;
import com.iis.PetClinic.repository.IUserRepository;
import com.iis.PetClinic.model.ServiceUsage;
import com.iis.PetClinic.model.Service;
import com.iis.PetClinic.model.Pet;
import com.iis.PetClinic.model.User;
import com.iis.PetClinic.model.Promotion;
import com.iis.PetClinic.controller.dto.ServiceUsageRequest;
import com.iis.PetClinic.service.IServiceUsageService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.iis.PetClinic.controller.dto.PromotionUsageSummary;

@RestController
@RequestMapping("/api/service-usage")
public class ServiceUsageController {

    private final IServiceUsageService usageService;
    private final IPromotionRepository promotionRepository;

    

    // add repositories for resolving ids when recording usage
    private final IClinicServiceRepository clinicServiceRepository;
    private final IPetRepository petRepository;
    private final IUserRepository userRepository;

    public ServiceUsageController(IServiceUsageService usageService,
                                  IPromotionRepository promotionRepository,
                                  IClinicServiceRepository clinicServiceRepository,
                                  IPetRepository petRepository,
                                  IUserRepository userRepository) {
        this.usageService = usageService;
        this.promotionRepository = promotionRepository;
        this.clinicServiceRepository = clinicServiceRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/promotion/{id}")
    public ResponseEntity<?> getUsagesForPromotion(@PathVariable Long id,
                                                   @RequestParam(required = false)
                                                   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                                           LocalDateTime from,
                                                   @RequestParam(required = false)
                                                   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                                           LocalDateTime to) {
        Optional<Promotion> p = promotionRepository.findById(id);
        if (p.isEmpty()) return ResponseEntity.notFound().build();

        List<ServiceUsage> usages;
        if (from != null && to != null) {
            usages = usageService.getUsagesForPromotionAndPeriod(p.get(), from, to);
        } else {
            usages = usageService.getUsagesForPromotion(p.get());
        }

        return ResponseEntity.ok(usages);
    }

    @GetMapping("/promotion/{id}/summary")
    public ResponseEntity<?> getSummaryForPromotion(@PathVariable Long id,
                                                   @RequestParam(required = false)
                                                   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                                           LocalDateTime from,
                                                   @RequestParam(required = false)
                                                   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                                           LocalDateTime to) {
        Optional<Promotion> p = promotionRepository.findById(id);
        if (p.isEmpty()) return ResponseEntity.notFound().build();

        List<ServiceUsage> usages;
        if (from != null && to != null) {
            usages = usageService.getUsagesForPromotionAndPeriod(p.get(), from, to);
        } else {
            usages = usageService.getUsagesForPromotion(p.get());
        }

        PromotionUsageSummary summary = new PromotionUsageSummary();
        summary.setPromotionId(id);
        summary.setTotalUses(usages.size());

        // total savings
        BigDecimal totalSavings = usages.stream()
                .map(u -> u.getSavings() == null ? BigDecimal.ZERO : u.getSavings())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalSavings(totalSavings);

        // clients (owner full names) - avoid duplicates
        Set<String> clients = new HashSet<>();
        for (ServiceUsage u : usages) {
            if (u.getPet() != null && u.getPet().getOwner() != null) {
                String ownerName = String.join(" ",
                        u.getPet().getOwner().getFirstName() == null ? "" : u.getPet().getOwner().getFirstName(),
                        u.getPet().getOwner().getLastName() == null ? "" : u.getPet().getOwner().getLastName()).trim();
                if (!ownerName.isEmpty()) clients.add(ownerName);
            }
        }
        summary.setClients(new ArrayList<>(clients));

        // service counts
        Map<String, Integer> serviceCounts = new HashMap<>();
        for (ServiceUsage u : usages) {
            String svcName = u.getService() != null ? u.getService().getName() : "<unknown>";
            serviceCounts.put(svcName, serviceCounts.getOrDefault(svcName, 0) + 1);
        }
        summary.setServiceCounts(serviceCounts);

        return ResponseEntity.ok(summary);
    }

    @PostMapping("/record")
    public ResponseEntity<?> recordUsage(@RequestBody ServiceUsageRequest req) {
        // validate and map ids to entities
        ServiceUsage usage = new ServiceUsage();

        clinicServiceRepository.findById(req.getServiceId()).ifPresent(usage::setService);
        if (req.getPromotionId() != null) {
            promotionRepository.findById(req.getPromotionId()).ifPresent(usage::setPromotion);
        }
        petRepository.findById(req.getPetId()).ifPresent(usage::setPet);
        if (req.getPerformedById() != null) userRepository.findById(req.getPerformedById()).ifPresent(usage::setPerformedBy);

        usage.setUsageDate(req.getUsageDate());
        usage.setPricePaid(req.getPricePaid());
        usage.setSavings(req.getSavings());

        ServiceUsage saved = usageService.record(usage);
        return ResponseEntity.ok(saved);
    }
}
