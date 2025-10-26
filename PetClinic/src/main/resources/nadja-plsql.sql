-- =================================================================
-- ZADATAK 1: Triger za bezbedno brisanje i arhiviranje veterinara
-- AUTOR: [Vaše Ime i Prezime]
-- =================================================================

-- KORAK 0: Priprema - Kreiranje arhivske tabele
-- Ovu komandu izvršite samo jednom.
DROP TABLE IF EXISTS archived_veterinarians;
CREATE TABLE archived_veterinarians (
                                        vet_id BIGINT PRIMARY KEY,
                                        user_id BIGINT,
                                        email VARCHAR(255),
                                        first_name VARCHAR(255),
                                        last_name VARCHAR(255),
                                        specialization VARCHAR(255),
                                        phone_number VARCHAR(255),
                                        archived_at TIMESTAMP WITH TIME ZONE
);

-- Čistimo arhivu pre svakog testiranja
DELETE FROM archived_veterinarians;


-- =================================================================
-- KORAK 1: Kreiranje PL/SQL Funkcije za Triger
-- =================================================================

CREATE OR REPLACE FUNCTION safe_delete_and_archive_veterinarian()
RETURNS TRIGGER AS $$
DECLARE
v_assigned_pets_count INT;
    v_vet_record veterinarians%ROWTYPE;
BEGIN

    -- === KORAK 1.1: PROVERA ULOGE ===
    -- Triger se izvršava samo ako je korisnik koji se briše VETERINAR.
    -- Ako nije, odmah dozvoljavamo brisanje bez dalje logike.
    IF OLD.role <> 'VETERINARIAN' THEN
        RETURN OLD;
END IF;

    -- Pronalazimo zapis o veterinaru na osnovu user_id
SELECT * INTO v_vet_record FROM veterinarians WHERE user_id = OLD.id;

-- Ako iz nekog razloga ne postoji zapis u veterinarians tabeli, preskačemo
IF NOT FOUND THEN
        RAISE NOTICE 'User sa ID % ima ulogu VETERINARIAN, ali ne postoji u tabeli veterinarians.', OLD.id;
RETURN OLD; -- Dozvoli brisanje korisnika
END IF;

    -- === KORAK 1.2: VALIDACIJA ===
    -- Proveravamo da li veterinar ima aktivne pacijente koji su mu dodeljeni.
SELECT COUNT(*)
INTO v_assigned_pets_count
FROM pets
WHERE veterinarian_id = v_vet_record.id;

IF v_assigned_pets_count > 0 THEN
        RAISE EXCEPTION 'Nije moguće obrisati veterinara: Dodeljen je za % pacijenta/pacijenata.', v_assigned_pets_count;
END IF;

    -- === KORAK 2: ARHIVIRANJE PODATAKA ===
    -- Ako je validacija prošla, arhiviramo podatke veterinara pre brisanja.
INSERT INTO archived_veterinarians (vet_id, user_id, email, first_name, last_name, specialization, phone_number, archived_at)
VALUES (
           v_vet_record.id,
           OLD.id,
           OLD.email,
           OLD.first_name,
           OLD.last_name,
           v_vet_record.specialization,
           v_vet_record.phone_number,
           NOW()
       );

-- === KORAK 3: ČIŠĆENJE VEZA ===
-- Brisemo zapis iz `veterinarians` tabele. Ovo je neophodno jer
-- `users` je roditeljska tabela i ne može se obrisati dok postoji dete.
DELETE FROM veterinarians WHERE id = v_vet_record.id;

-- === KORAK 4: DOZVOLA ZA BRISANJE ===
-- Vraćamo OLD, što signalizira PostgreSQL-u da nastavi sa originalnom
-- DELETE operacijom na tabeli `users`.
RAISE NOTICE 'Veterinar % % (ID: %) je uspešno arhiviran i obrisan.', OLD.first_name, OLD.last_name, OLD.id;
RETURN OLD;

END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- KORAK 2: Kreiranje samog Trigera
-- =================================================================

-- Prvo brišemo stari triger ako postoji da bismo izbegli greške
DROP TRIGGER IF EXISTS trg_before_user_delete_check_vet ON users;

-- Kreiranje trigera koji se aktivira PRE brisanja na tabeli USERS
CREATE TRIGGER trg_before_user_delete_check_vet
    BEFORE DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION safe_delete_and_archive_veterinarian();