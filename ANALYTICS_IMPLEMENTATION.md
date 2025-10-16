# 📊 Analitika i Izveštaji - Pet Clinic

## 🎯 Pregled

Sistem analitike omogućava menadžerima veterinarske klinike da dobiju uvid u:
- **Najčešće bolesti po vrstama životinja** 
- **Broj vakcinacija u određenom vremenskom periodu**
- **Najčešće primenjivane terapije i tretmane**
- **Trendove i statistike** za donošenje odluka o planiranju resursa

## 🚀 Kako pokrenuti

### Backend (Java Spring Boot)
```bash
cd PetClinic
mvn spring-boot:run
```
Backend će biti dostupan na: `http://localhost:8080`

### Frontend (React)
```bash
cd front/pet-clinic-frontend
npm install
npm start
```
Frontend će biti dostupan na: `http://localhost:3000`

## 📡 API Endpoint-i

### Osnovna analitika

#### 1. Kompletan sažetak analitike
```
GET /api/analytics/summary?startDate=2024-01-01&endDate=2024-12-31
```
**Odgovor:** Potpuna statistika sa top 5 bolesti, terapija, vakcinacija + osnovni brojevi

#### 2. Najčešće bolesti
```
GET /api/analytics/diseases?startDate=2024-01-01&endDate=2024-12-31
```

#### 3. Najčešće terapije
```
GET /api/analytics/therapies?startDate=2024-01-01&endDate=2024-12-31
```

#### 4. Vakcinacije u periodu
```
GET /api/analytics/vaccinations?startDate=2024-01-01&endDate=2024-12-31
```

### Napredni izveštaji

#### 5. Bolesti po vrsti životinje
```
GET /api/analytics/diseases/by-animal-type/Pas?startDate=2024-01-01&endDate=2024-12-31
```

#### 6. Mesečni trendovi bolesti
```
GET /api/analytics/diseases/monthly-trends?startDate=2024-01-01&endDate=2024-12-31
```

### Predefined periodi (brži pozivi)

```
GET /api/analytics/summary/last-month     # Poslednji mesec
GET /api/analytics/summary/last-quarter   # Poslednji kvartal
GET /api/analytics/summary/last-year      # Poslednja godina
GET /api/analytics/dashboard              # Dashboard statistike (kvartal)
```

## 🖥️ Frontend stranica

**URL:** `http://localhost:3000/analytics`

### Funkcionalnosti:
- **Period selektor:** Poslednji mesec/kvartal/godina ili prilagođeni period
- **Sažetak statistika:** Ukupan broj izveštaja, životinja, vakcinacija
- **Tabele sa top 10:** Bolesti, terapije, vakcinacije
- **Responzivni dizajn** za sve uređaje

## 📊 Kako funkcioniše analitika

### Podaci se uzimaju iz:
1. **`MedicalReport`** tabela:
   - `dijagnoza` → koristi se za statistike bolesti
   - `terapija` → koristi se za statistike terapija  
   - `datum` → za filtriranje po periodu
   - `pet.animaltype` → grupiranje po vrsti životinje

2. **`Item`** tabela sa `MedicalReport`:
   - Items sa `category = 'MEDICINE'` i `name` sadrži 'vakcin' → vakcinacije

### SQL Query-ji:
Svi query-ji su optimizovani i rade direktno sa bazom podataka kroz JPA repository.

## 🔧 Kako dodati u postojeći sistem

### 1. Backend integraacija
Dodaj u glavni meni ili dashboard link ka analitici:
```javascript
<a href="/analytics">📊 Analitika i Izveštaji</a>
```

### 2. Autorizacija
U `AnalyticsController` dodaj `@PreAuthorize("hasRole('MANAGER')")` ako želiš da ograniče pristup samo menadžerima.

### 3. Dodaj u navigaciju
```javascript
import AnalyticsPage from './analytics/AnalyticsPage';

// U App.js
<Route path="/analytics" element={<AnalyticsPage />} />
```

## 📈 Primer odgovora API-ja

### GET /api/analytics/summary/last-quarter
```json
{
  "periodStart": "2024-07-01",
  "periodEnd": "2024-10-01", 
  "totalReports": 156,
  "totalPets": 89,
  "totalVaccinations": 45,
  "topDiseases": [
    {
      "diseaseName": "Gastritis",
      "animalTypeName": "Pas", 
      "count": 23,
      "percentage": 14.7
    }
  ],
  "topTherapies": [
    {
      "therapyName": "Antibiotska terapija",
      "animalTypeName": "Pas",
      "count": 18, 
      "percentage": 11.5
    }
  ],
  "animalTypeStatistics": [
    {
      "animalTypeName": "Pas",
      "reportCount": 89,
      "mostCommonDisease": "Gastritis", 
      "mostCommonTherapy": "Antibiotska terapija"
    }
  ]
}
```

## 🛠️ Tehnički detalji

### Backend komponente:
- `AnalyticsController` - REST endpoint-i
- `AnalyticsService` - business logika  
- `IAnalyticsRepository` - custom SQL query-ji
- DTO klase za različite tipove odgovora

### Frontend komponente:
- `AnalyticsPage.js` - glavna komponenta
- `AnalyticsPage.css` - styling sa responzivnim dizajnom

### Baza podataka:
Koristi postojeće tabele (`medical_reports`, `pets`, `animal_types`, `items`) - **nema novih tabela!**

## 🚨 Troubleshooting

### Problem: "Failed to fetch analytics"
**Rešenje:** Proveri da li backend radi na portu 8080 i da li je baza podataka pokrenuta.

### Problem: "No data available"  
**Rešenje:** Dodaj test podatke u `medical_reports` tabelu ili promeni period za analizu.

### Problem: Autorizacija greška
**Rešenje:** Osiguraj se da je korisnik ulogovan i da ima potrebne dozvole.

---

## 🎉 Završeno!

Analitika je potpuno implementirana i ready za korišćenje! Menadžeri mogu da:
- Prate sezonske bolesti
- Planiraju resurse na osnovu trendova  
- Analiziraju efikasnost terapija
- Prate vakcinacije po vrstama životinja