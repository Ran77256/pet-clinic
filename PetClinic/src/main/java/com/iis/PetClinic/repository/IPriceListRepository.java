// com/iis/PetClinic/repository/PriceListRepository.java
package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.PriceList;
import com.iis.PetClinic.model.PriceListStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IPriceListRepository extends JpaRepository<PriceList, Long> {

    Optional<PriceList> findFirstByStatusOrderByVersionDesc(PriceListStatus status);

    @Query("""
      select p from PriceList p
      where p.status = com.iis.PetClinic.model.PriceListStatus.ACTIVE
        and p.validFrom <= :at
        and (p.validTo is null or p.validTo >= :at)
      """)
    Optional<PriceList> findActiveAt(@Param("at") LocalDateTime at);

    // Jednostavno: sve draft verzije, bez fetch-a
    List<PriceList> findByStatusOrderByVersionDesc(PriceListStatus status);

    // Optimizovano: sve draft verzije sa stavkama i servisima (izbegava N+1)
    @Query("""
       select distinct p from PriceList p
       left join fetch p.items i
       left join fetch i.service s
       WHERE p.status IN (com.iis.PetClinic.model.PriceListStatus.DRAFT, com.iis.PetClinic.model.PriceListStatus.ARCHIVED)
       order by p.version desc
    """)
    List<PriceList> findDraftsWithItems();
}
