// com/iis/PetClinic/repository/PriceListRepository.java
package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.PriceList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IPriceListRepository extends JpaRepository<PriceList, Long> { }
