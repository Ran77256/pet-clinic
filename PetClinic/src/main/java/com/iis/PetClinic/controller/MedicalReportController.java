package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.MedicalReportCreateRequest;
import com.iis.PetClinic.dto.request.MedicalReportUpdateRequest;
import com.iis.PetClinic.dto.response.MedicalReportResponse;
import com.iis.PetClinic.model.MedicalReport;
import com.iis.PetClinic.model.Pet;
import com.iis.PetClinic.service.IMedicalReportService;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;


import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import com.itextpdf.layout.Document; // DODATI


@RestController
@RequestMapping(value = "/api/reports", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin
@RequiredArgsConstructor
public class MedicalReportController {

    private final IMedicalReportService service;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public MedicalReportResponse create(@RequestBody MedicalReportCreateRequest req) {
        return service.create(req);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public MedicalReportResponse update(@PathVariable Long id,
                                         @RequestBody MedicalReportUpdateRequest req) {
        return service.update(id, req);
    }

    @GetMapping("/{id}")
    public MedicalReportResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // liste za UI
    @GetMapping("/by-pet/{petId}")
    public List<MedicalReportResponse> listByPet(@PathVariable Long petId) {
        return service.listByPet(petId);
    }

    @GetMapping("/by-vet/{vetId}")
    public List<MedicalReportResponse> listByVet(@PathVariable Long vetId) {
        return service.listByVeterinarian(vetId);
    }

    @GetMapping("/by-pet/{petId}/between")
    public List<MedicalReportResponse> listByPetBetween(@PathVariable Long petId,
                                                        @RequestParam LocalDate from,
                                                        @RequestParam LocalDate to) {
        return service.listByPetAndDate(petId, from, to);
    }
    @GetMapping(
            value = "/{id}/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> getReportPdf(@PathVariable Long id) {
        // 1) Uzmi report (baci 404 ako nema)
        var report = service.findById(id); // <-- TI SI TRAŽILA OVO DA GENERIŠEM
        // 2) Generiši PDF u memoriji (iText)
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // VAŽNO: koristi iText layout Document, ne javax.swing.text.Document!
        // import com.itextpdf.layout.Document;
        com.itextpdf.kernel.pdf.PdfWriter writer = new PdfWriter(baos);
        com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(writer);
        com.itextpdf.layout.Document doc = new com.itextpdf.layout.Document(pdf);

        doc.add(new com.itextpdf.layout.element.Paragraph("Medical Report #" + report.getId())
                .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));
        doc.add(new com.itextpdf.layout.element.Paragraph(
                "Pet: " + report.getPet().getName() + "  |  Vet: " + report.getVeterinarian().getUser().getFirstName()));
        doc.add(new com.itextpdf.layout.element.Paragraph(
                "Date: " + report.getCreatedAt()));
        doc.add(new com.itextpdf.layout.element.Paragraph(
                "Diagnosis: " + report.getDijagnoza()));
        doc.add(new com.itextpdf.layout.element.Paragraph(
                "Therapy: " + report.getTerapija()));
        doc.close();

        byte[] pdfBytes = baos.toByteArray();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "report-" + id + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    private byte[] generatePdf(MedicalReport report) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Header
        document.add(new Paragraph("PetClinic - Medicinski Izveštaj")
                .setFontSize(18).setBold().setTextAlignment(TextAlignment.CENTER));

        // Pet info
        Pet pet = report.getPet();
        document.add(new Paragraph("Ljubimac: " + pet.getName()));
        document.add(new Paragraph("Vrsta: " + (pet.getAnimaltype() != null ? pet.getAnimaltype() : "N/A")));
        document.add(new Paragraph("Datum: " + report.getDatum()));
        document.add(new Paragraph("Dijagnoza: " + report.getDijagnoza()));

        if (report.getTerapija() != null) {
            document.add(new Paragraph("Terapija: " + report.getTerapija()));
        }

        document.close();
        return baos.toByteArray();
    }
}
