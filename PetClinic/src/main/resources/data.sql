-- Seed data for promotions and service usages
-- Note: column names assume Spring's default naming strategy (snake_case) and some explicit table names used in entities.

-- Users (owners and staff)
INSERT INTO users (id, password, first_name, last_name, email, role, last_activated) VALUES (1, 'passhash', 'Marko', 'Markovic', 'marko@example.com', 'USER', now());
INSERT INTO users (id, password, first_name, last_name, email, role, last_activated) VALUES (2, 'passhash', 'Ana', 'Anic', 'ana@example.com', 'USER', now());
INSERT INTO users (id, password, first_name, last_name, email, role, last_activated) VALUES (10, 'passhash', 'Ivan', 'Vet', 'ivan.vet@example.com', 'VETERINARIAN', now());

-- Animal types
INSERT INTO animal_type (id, name) VALUES (1, 'Pas');
INSERT INTO animal_type (id, name) VALUES (2, 'Macka');

-- Services
INSERT INTO service (id, name, description, client_type, animal_type_id) VALUES (100, 'Vakcinacija', 'Vakcinacija za pse i mačke', 'INDIVIDUAL', 1);
INSERT INTO service (id, name, description, client_type, animal_type_id) VALUES (101, 'Pregled', 'Opšti pregled', 'INDIVIDUAL', 1);

-- Promotions
INSERT INTO promotion (id, name, benefit_type, status, client_type, service_id, animal_type_id, value, start_date, end_date) VALUES (200, 'Prolecna akcija 20% vakcinacije', 'PERCENTAGE_DISCOUNT', 'INACTIVE', 'INDIVIDUAL', 100, 1, 20.00, '2025-03-01 00:00:00', '2025-03-31 23:59:59');
INSERT INTO promotion (id, name, benefit_type, status, client_type, service_id, animal_type_id, value, start_date, end_date) VALUES (201, 'Novi vlasnici 15%', 'PERCENTAGE_DISCOUNT', 'INACTIVE', 'INDIVIDUAL', 101, 1, 15.00, '2025-06-01 00:00:00', '2025-06-30 23:59:59');

-- Pets
INSERT INTO pets (id, birth_date, name, microchip_number, description, owner_id, species_id, breed_id, veterinarian_id) VALUES (500, '2020-05-10', 'Rex', 'MC12345', 'Pas, srednje rase', 1, 1, null, 1);
INSERT INTO pets (id, birth_date, name, microchip_number, description, owner_id, species_id, breed_id, veterinarian_id) VALUES (501, '2021-11-02', 'Luna', 'MC54321', 'Macka', 2, 2, null, 1);

-- Service usages (some tied to promotions)
INSERT INTO service_usage (id, service_id, promotion_id, pet_id, performed_by_id, usage_date, price_paid, savings) VALUES (1000, 100, 200, 500, 1, '2025-03-10 10:00:00', 2000.00, 400.00);
INSERT INTO service_usage (id, service_id, promotion_id, pet_id, performed_by_id, usage_date, price_paid, savings) VALUES (1001, 100, 200, 500, 1, '2025-03-15 11:30:00', 2000.00, 400.00);
INSERT INTO service_usage (id, service_id, promotion_id, pet_id, performed_by_id, usage_date, price_paid, savings) VALUES (1002, 101, 201, 501, 1, '2025-06-05 09:00:00', 1500.00, 225.00);
INSERT INTO service_usage (id, service_id, promotion_id, pet_id, performed_by_id, usage_date, price_paid, savings) VALUES (1003, 101, NULL, 501, 1, '2025-07-01 09:30:00', 1500.00, 0.00);

-- End of seed
