package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.projection.ExpirationRiskProjection;
import com.iis.PetClinic.dto.request.AddProductRequest;
import com.iis.PetClinic.dto.response.ExpirationRiskDTO;
import com.iis.PetClinic.dto.response.ItemTotalQuantityDTO;
import com.iis.PetClinic.dto.response.ProductResponse;
import com.iis.PetClinic.dto.response.WriteOffDTO;
import com.iis.PetClinic.exception.BarcodeAlreadyExistsException;
import com.iis.PetClinic.model.*;
import com.iis.PetClinic.repository.IItemRepository;
import com.iis.PetClinic.repository.INotificationRepository;
import com.iis.PetClinic.repository.IProductRepository;
import com.iis.PetClinic.service.INotificationService;
import com.iis.PetClinic.service.IProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ProductService implements IProductService {

    @Autowired
    private IProductRepository productRepository;

    @Autowired
    private IItemRepository itemRepository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private INotificationRepository notificationRepository;

    private final Random random = new Random();

    private static final int MIN_BARCODE = 100000;
    private static final int MAX_BARCODE = 999999;

    @Override
    public List<ProductResponse> getAllProductsByItemId(int itemId){
        var products = productRepository.findAllByItem_Id(itemId);

        if(products.isEmpty()) {
        return null;
        }

        return products.stream().map(product -> {
            var productResponse = new ProductResponse();
            productResponse.setBarcode(product.getBarcode());
            productResponse.setEntryDate(product.getEntryDate());
            productResponse.setReason(product.getReason());
            productResponse.setQuantity(product.getQuantity());
            productResponse.setWriteOffDate(product.getWriteOffDate());
            productResponse.setSupplierEmail(product.getSupplierEmail());
            productResponse.setItemId(product.getItem().getId());
            productResponse.setExpirationDate(product.getExpirationDate());
            productResponse.setConsumedQuantity(product.getConsumedQuantity());

            return productResponse;
        }).collect(Collectors.toList());
    }

    @Override
    public ProductResponse addProduct(AddProductRequest request) {
        var optionalItem = itemRepository.findById(request.getItemId());
        if (optionalItem.isEmpty()) {
            return null;
        }
        var item = optionalItem.get();
        var product = new Product();
        var numericBarcode = Integer.parseInt(request.getBarcode());
        int quantity = extractQuantityFromPackaging(item.getPackaging());
        product.setBarcode(numericBarcode);
        product.setItem(item);
        product.setQuantity(quantity);
        product.setSupplierEmail(null);
        product.setEntryDate(request.getEntryDate());
        product.setExpirationDate(request.getExpirationDate());

        try {
            var savedProduct = productRepository.save(product);
            item.setStockLevel(item.getStockLevel() + 1);
            itemRepository.save(item);

            var response = new ProductResponse();
            response.setBarcode(savedProduct.getBarcode());
            response.setEntryDate(savedProduct.getEntryDate());
            response.setExpirationDate(savedProduct.getExpirationDate());
            response.setQuantity(savedProduct.getQuantity());

            return response;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.err.println("Data Integrity Violation: " + e.getMessage());

            throw new BarcodeAlreadyExistsException("Barkod vec postoji!", e);

        } catch (Exception e) {
            throw new RuntimeException("Neuspelo dodavanje proizvoda zbog nepoznate greške.", e);
        }
    }

        private int extractQuantityFromPackaging(String packaging) {
            if (packaging == null) return 0;

            var pattern = Pattern.compile("(\\d+)(?=\\s*[a-zA-Z])");
            var matcher = pattern.matcher(packaging);

            if (matcher.find()) {
                try {
                    return Integer.parseInt(matcher.group(1));
                } catch (NumberFormatException e) {
                    return 0;
                }
            }
            return 0;
        }

    @Scheduled(cron = "0 19 17 * * ?")
    @Override
    @Transactional
    public void writeOffProduct(){
        var products = productRepository.findAll();
        for(Product product: products){
            if(product.getExpirationDate().isBefore(LocalDate.now()) &&
            product.getWriteOffDate() == null){
                product.setWriteOffDate(LocalDate.now());
                product.setReason("Istekao rok trajanja");
                product.setConsumedQuantity(product.getItem().getPackaging());

                productRepository.save(product);

                var description = notificationService.createNotificationDescription(product.getItem().getName(), product.getItem().getCategory().getName(), product.getBarcode(), product.getWriteOffDate());
                var notification = new Notification();
                notification.setCreatedAt(LocalDate.now());
                notification.setDescription(description);
                notification.setStatus(NotificationStatus.UNREAD);
                notification.setType(NotificationType.PRODUCT_WRITTEN_OFF);
                notificationRepository.save(notification);
            }
        }
        System.out.println("Cron Job: Završen otpis proizvoda sa isteklim rokom.");
    }

    public Integer generateUniqueBarcode() {
        Integer newBarcode;
        boolean exists;

        do {
            newBarcode = random.nextInt(MAX_BARCODE - MIN_BARCODE + 1) + MIN_BARCODE;

            exists = productRepository.existsByBarcode(newBarcode);

        } while (exists);

        return newBarcode;
    }

    public void updateProductsAfterOrder(Order order){
        for(int i = 0; i < order.getQuantity(); i++) {
            var product = new Product();
            product.setItem(order.getItem());
            product.setBarcode(generateUniqueBarcode());
            product.setExpirationDate(LocalDate.now().plusYears(2));
            product.setEntryDate(LocalDate.now());
            product.setSupplierEmail(order.getEmail());
            product.setQuantity(extractQuantityFromPackaging(order.getItem().getPackaging()));
            productRepository.save(product);
        }
        var item = order.getItem();
        item.setStockLevel(item.getStockLevel() + order.getQuantity());
        itemRepository.save(item);

        var description = notificationService.createOrderArrivalDescription(order.getId(), order.getItem().getName());
        var notification = new Notification();
        notification.setType(NotificationType.NEW_ORDER);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setCreatedAt(LocalDate.now());
        notification.setDescription(description);

        notificationRepository.save(notification);
    }

    @Override
    public List<WriteOffDTO> getTop5ExpiredWriteOffs() {
        Pageable topFive = PageRequest.of(0, 5);

        return productRepository.findTopExpiredWriteOffs(topFive).getContent();
    }

    @Override
    public List<ExpirationRiskDTO> getExpirationRiskItems() {
        List<ExpirationRiskProjection> projections = productRepository.findExpirationRiskItems();

        return projections.stream()
                .map(p -> new ExpirationRiskDTO(p.getItemName(), p.getExpirationDate()))
                .collect(Collectors.toList());
    }

    @Override
    public List<ItemTotalQuantityDTO> getAvailableStockSummary() {
        return productRepository.findGroupedQuantitiesWithoutReason();
    }
}
