-- =================================================================
-- ZADATAK 1: Triger za bezbedno brisanje i arhiviranje veterinara
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



------------------------------------------------------------------------------------------------


-- =================================================================
-- ZADATAK 2: PL/SQL Funkcija za analizu opterećenosti veterinara
-- =================================================================

CREATE OR REPLACE FUNCTION get_vet_workload_status(p_vet_id BIGINT)
RETURNS TEXT AS $$
DECLARE
v_vet_patient_count BIGINT;
    v_avg_patients_per_vet NUMERIC;
    v_workload_status TEXT;
BEGIN
    -- === KORAK 1: Izračunavanje prosečnog broja pacijenata po veterinaru u celoj klinici ===
    -- Koristimo podupit da bismo dobili ukupan broj pacijenata i ukupan broj veterinara
SELECT
    -- Delimo ukupan broj pacijenata sa ukupnim brojem veterinara.
    -- CAST se koristi da bi deljenje bilo sa pokretnim zarezom (decimalno).
    (SELECT COUNT(*) FROM pets)::NUMERIC / (SELECT COUNT(*) FROM veterinarians)::NUMERIC
INTO v_avg_patients_per_vet;

-- Ako nema veterinara da se izbegne deljenje sa nulom
IF v_avg_patients_per_vet IS NULL THEN
        v_avg_patients_per_vet := 0;
END IF;

    -- === KORAK 2: Izračunavanje broja pacijenata za SPECIFIČNOG veterinara ===
SELECT COUNT(*)
INTO v_vet_patient_count
FROM pets
WHERE veterinarian_id = p_vet_id;

-- === KORAK 3: Logika za određivanje statusa ===
-- Koristimo CASE izraz da poredimo broj pacijenata veterinara sa prosekom.
v_workload_status := CASE
        WHEN v_vet_patient_count < v_avg_patients_per_vet * 0.5 THEN 'Neopterećen'
        WHEN v_vet_patient_count > v_avg_patients_per_vet * 1.5 THEN 'Preopterećen'
        ELSE 'Optimalan'
END;

RETURN v_workload_status;

END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- PRIMER POZIVA FUNKCIJE U SQL UPITU
-- =================================================================

-- Ovaj upit prikazuje sve veterinare, njihov broj pacijenata
-- i status opterećenosti dobijen pozivom naše nove funkcije.

SELECT
        u.first_name || ' ' || u.last_name AS veterinar,
        v.specialization,
        (SELECT COUNT(*) FROM pets p WHERE p.veterinarian_id = v.id) AS broj_pacijenata,
        -- Pozivamo našu PL/SQL funkciju za svakog veterinara
        get_vet_workload_status(v.id) AS status_opterecenosti
FROM
    veterinarians v
        JOIN
    users u ON v.user_id = u.id
ORDER BY
    broj_pacijenata DESC;




----------------------------------------------------------------------------------------------------------


-- =================================================================
-- ZADATAK 3: SQL Indeksi za optimizaciju pretrage veterinara
-- =================================================================

-- =================================================================
-- KORAK 1: PRIPREMA I ČIŠĆENJE
-- =================================================================
-- Obrišite stari indeks ako postoji da bismo mogli da merimo bez njega.
DROP INDEX IF EXISTS idx_users_lastname_firstname;

-- Obrišite sve prethodno generisane testne veterinare da test bude čist.
-- Prvo brišemo iz `veterinarians` zbog stranog ključa.
DELETE FROM veterinarians WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'mock.vet.%');
DELETE FROM users WHERE email LIKE 'mock.vet.%';

-- Resetujemo sekvence za ID-jeve.
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('veterinarians_id_seq', (SELECT COALESCE(MAX(id), 1) FROM veterinarians));


-- =================================================================
-- KORAK 2: GENERISANJE TEST PODATAKA (100,000 veterinara)
-- =================================================================

CREATE OR REPLACE PROCEDURE generate_mock_veterinarians()
LANGUAGE plpgsql
AS $$
DECLARE
i INT;
    v_user_id INT;
    last_names TEXT[] := ARRAY['Petrović', 'Jovanović', 'Nikolić', 'Marković', 'Đorđević'];
    specializations TEXT[] := ARRAY['Hirurg', 'Internista', 'Kardiolog', 'Dermatolog', 'Ortoped'];
BEGIN
    RAISE NOTICE 'Starting mock veterinarian generation...';
FOR i IN 1..100000 LOOP
        -- Kreiramo novog korisnika (User) sa ulogom VETERINARIAN
        INSERT INTO users (password, first_name, last_name, email, role)
        VALUES (
            'pass123',
            'Ime' || i,
            last_names[floor(random() * 5 + 1)],
            'mock.vet.' || i || '@example.com',
            'VETERINARIAN'
        ) RETURNING id INTO v_user_id;

        -- Kreiramo povezani zapis u veterinarians tabeli
INSERT INTO veterinarians (specialization, phone_number, user_id)
VALUES (
           specializations[floor(random() * 5 + 1)],
           '06' || (1000000 + i)::text,
           v_user_id
       );

IF i % 10000 = 0 THEN RAISE NOTICE 'Inserted % veterinarians...', i; END IF;
END LOOP;
    RAISE NOTICE 'Data generation finished.';
END;
$$;

-- Pozivamo proceduru da generiše podatke
CALL generate_mock_veterinarians();

-- Analiziramo tabelu da bi planer upita imao sveže statistike
ANALYZE users;
ANALYZE veterinarians;


-- =================================================================
-- KORAK 3: TEST PRETRAGE PO PREZIMENU I IMENU VETERINARA
-- =================================================================

-- Korak 3.1: Merenje BEZ indeksa
-- Tražimo sve veterinare koji se prezivaju 'Marković' i čije ime počinje sa 'Ime123'
EXPLAIN ANALYZE
SELECT u.first_name, u.last_name, v.specialization
FROM users u
         JOIN veterinarians v ON u.id = v.user_id
WHERE u.last_name = 'Marković' AND u.first_name LIKE 'Ime123%';

/*
-- STVARNI REZULTAT (BEZ INDEKSA):
-- Planer se odlučuje za "Seq Scan", što znači da mora da prođe kroz celu tabelu (svih 100,000+ redova).
-- Vreme izvršenja je 24.234 ms.

"Nested Loop  (cost=0.29..2766.86 rows=2 width=27) (actual time=2.402..23.020 rows=17 loops=1)"
"  ->  Seq Scan on users u  (cost=0.00..2750.24 rows=2 width=22) (actual time=2.126..22.712 rows=17 loops=1)"
"        Filter: (((first_name)::text ~~ 'Ime123%'::text) AND ((last_name)::text = 'Marković'::text))"
"        Rows Removed by Filter: 99999"
"  ->  Index Scan using veterinarians_user_id_key on veterinarians v  (cost=0.29..8.31 rows=1 width=13) (actual time=0.017..0.017 rows=1 loops=17)"
"        Index Cond: (user_id = u.id)"
"Planning Time: 15.735 ms"
"Execution Time: 24.234 ms"
*/


-- Korak 3.2: Kreiranje kompozitnog B-Tree indeksa
-- Kreiramo JEDAN indeks koji pokriva OBE kolone koje pretražujemo.
-- Redosled kolona u indeksu treba da odgovara redosledu u upitu za najbolje performanse.
CREATE INDEX idx_users_lastname_firstname ON users (last_name, first_name);


-- Korak 3.3: Merenje SA indeksom
EXPLAIN ANALYZE
SELECT u.first_name, u.last_name, v.specialization
FROM users u
         JOIN veterinarians v ON u.id = v.user_id
WHERE u.last_name = 'Marković' AND u.first_name LIKE 'Ime123%';

/*
-- STVARNI REZULTAT (SA INDEKSOM):
-- Planer sada koristi "Bitmap Heap Scan", koji se oslanja na "Bitmap Index Scan"
-- nad našim novim indeksom 'idx_users_lastname_firstname'.
-- Ovo omogućava bazi da trenutno locira tražene podatke bez skeniranja cele tabele.
-- Vreme izvršenja je drastično smanjeno na 10.822 ms.

"Nested Loop  (cost=555.46..2123.29 rows=2 width=27) (actual time=5.777..10.168 rows=17 loops=1)"
"  ->  Bitmap Heap Scan on users u  (cost=555.17..2106.67 rows=2 width=22) (actual time=5.550..9.892 rows=17 loops=1)"
"        Recheck Cond: ((last_name)::text = 'Marković'::text)"
"        Filter: ((first_name)::text ~~ 'Ime123%'::text)"
"        Rows Removed by Filter: 19978"
"        Heap Blocks: exact=1250"
"        ->  Bitmap Index Scan on idx_users_lastname_firstname  (cost=0.00..555.17 rows=20100 width=0) (actual time=4.785..4.786 rows=19995 loops=1)"
"              Index Cond: ((last_name)::text = 'Marković'::text)"
"  ->  Index Scan using veterinarians_user_id_key on veterinarians v  (cost=0.29..8.31 rows=1 width=13) (actual time=0.015..0.015 rows=1 loops=17)"
"        Index Cond: (user_id = u.id)"
"Planning Time: 9.186 ms"
"Execution Time: 10.822 ms"
*/


---------------------------------------------------------------------------------


-- =================================================================
-- ZADATAK 4: Izveštaj o Godišnjem Učinku Klinike po Vrstama Životinja
-- =================================================================

-- KORAK 1: Kreiranje složenih PL/SQL tipova
-- -----------------------------------------------------------------
-- Prvo brišemo stare tipove da bismo izbegli greške.
DROP TYPE IF EXISTS animal_type_annual_report CASCADE;

-- Definišemo složeni tip koji predstavlja strukturu našeg izveštaja za jednu vrstu.
CREATE TYPE animal_type_annual_report AS (
    animal_type_name TEXT,
    total_patients BIGINT,
    new_patients_in_year BIGINT,
    most_popular_breed TEXT,
    top_veterinarian TEXT
    );


-- KORAK 2: Kreiranje glavne PL/SQL funkcije za generisanje izveštaja
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_annual_clinic_report(p_year INTEGER)
-- Funkcija vraća tabelu našeg složenog tipa
RETURNS SETOF animal_type_annual_report AS $$
DECLARE
    -- Deklarišemo kursor koji će proći kroz sve vrste životinja (Pas, Mačka, itd.)
cur_animal_types CURSOR FOR SELECT id, name FROM animal_type;

-- Deklarišemo promenljive za čuvanje podataka iz kursora
v_animal_type_id BIGINT;
    v_animal_type_name TEXT;

    -- Deklarišemo promenljivu našeg složenog tipa koja će čuvati rezultat za jednu iteraciju
    v_report_row animal_type_annual_report;
BEGIN
    -- Otvaramo kursor
OPEN cur_animal_types;

-- Počinjemo petlju koja prolazi kroz svaki red iz kursora
LOOP
-- Učitavamo podatke iz trenutnog reda kursora u promenljive
FETCH cur_animal_types INTO v_animal_type_id, v_animal_type_name;
        -- Ako nema više redova, izlazimo iz petlje
        EXIT WHEN NOT FOUND;

        -- === Počinje složeni SQL upit za prikupljanje podataka za TRENUTNU vrstu životinje ===
WITH
    -- CTE 1: Svi pacijenti koji pripadaju trenutnoj vrsti životinje
    RelevantPets AS (
        SELECT p.id, p.birth_date, p.breed_id, p.veterinarian_id
        FROM pets p
        WHERE p.species_id = v_animal_type_id
    ),
    -- CTE 2: Agregacija po rasama da pronađemo najpopularniju
    BreedPopularity AS (
        SELECT b.name AS breed_name, COUNT(rp.id) AS patient_count
        FROM RelevantPets rp
                 JOIN breed b ON rp.breed_id = b.id
        GROUP BY b.name
        ORDER BY patient_count DESC
    LIMIT 1
    ),
    -- CTE 3: Agregacija po veterinarima da pronađemo najboljeg
    VetPopularity AS (
SELECT u.first_name || ' ' || u.last_name AS vet_name, COUNT(rp.id) AS patient_count
FROM RelevantPets rp
    JOIN veterinarians v ON rp.veterinarian_id = v.id
    JOIN users u ON v.user_id = u.id
GROUP BY vet_name
HAVING COUNT(rp.id) > 0 -- HAVING uslov   mozemo staviti i 1 da se vide performanse drugacije
ORDER BY patient_count DESC
    LIMIT 1
    )
-- Glavni SELECT koji spaja rezultate iz CTE-ova
SELECT
    v_animal_type_name,
    (SELECT COUNT(*) FROM RelevantPets),
    -- Brojimo samo ljubimce čiji je datum rođenja unutar tražene godine
    (SELECT COUNT(*) FROM RelevantPets WHERE EXTRACT(YEAR FROM birth_date) = p_year),
    (SELECT breed_name FROM BreedPopularity),
    (SELECT vet_name FROM VetPopularity)
INTO
    v_report_row; -- Rezultat smeštamo u našu promenljivu složenog tipa

-- Vraćamo popunjen red kao deo rezultata funkcije
RETURN NEXT v_report_row;

END LOOP;

    -- Zatvaramo kursor
CLOSE cur_animal_types;

RETURN; -- Završavamo funkciju
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- KORAK 3: Primer poziva funkcije (izveštaj za 2022. godinu)
-- =================================================================

-- Pozivamo funkciju kao da je tabela i dobijamo kompletan izveštaj.
SELECT * FROM generate_annual_clinic_report(2022);