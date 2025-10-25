package com.iis.PetClinic.controller.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class PromotionUsageSummary {
    private Long promotionId;
    private int totalUses;
    private BigDecimal totalSavings;
    private List<String> clients; // list of client names or identifiers
    private Map<String, Integer> serviceCounts; // serviceName -> count

    public PromotionUsageSummary() {
    }

    public Long getPromotionId() {
        return promotionId;
    }

    public void setPromotionId(Long promotionId) {
        this.promotionId = promotionId;
    }

    public int getTotalUses() {
        return totalUses;
    }

    public void setTotalUses(int totalUses) {
        this.totalUses = totalUses;
    }

    public BigDecimal getTotalSavings() {
        return totalSavings;
    }

    public void setTotalSavings(BigDecimal totalSavings) {
        this.totalSavings = totalSavings;
    }

    public List<String> getClients() {
        return clients;
    }

    public void setClients(List<String> clients) {
        this.clients = clients;
    }

    public Map<String, Integer> getServiceCounts() {
        return serviceCounts;
    }

    public void setServiceCounts(Map<String, Integer> serviceCounts) {
        this.serviceCounts = serviceCounts;
    }
}
