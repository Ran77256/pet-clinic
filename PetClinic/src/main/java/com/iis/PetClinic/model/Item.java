package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="items")
@NoArgsConstructor
@Getter
@Setter
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;

    private String packaging;

    private int minQuantity;

    @Column(nullable = true)
    private int stockLevel;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}
