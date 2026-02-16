

package com.iis.PetClinic.service.impl;
import com.iis.PetClinic.model.AppointmentStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class AnalyticsServiceStaff {

    @PersistenceContext
    private EntityManager em;

    public Map<String, Object> analyze(LocalDate fromDate,
                                       LocalDate toDate,
                                       String status,
                                       Long veterinarianId) {

        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to   = toDate.atTime(LocalTime.MAX);

        AppointmentStatus st = null;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            st = AppointmentStatus.valueOf(status.toUpperCase());
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("from", from);
        out.put("to", to);
        out.put("status", st != null ? st.name() : null);
        out.put("veterinarianId", veterinarianId);

        // ===== total
        {
            StringBuilder jpql = new StringBuilder("""
                select count(a) from Appointment a
                 where a.appointmentDate between :from and :to
            """);
            if (veterinarianId != null) jpql.append(" and a.veterinarian.id = :vetId");
            if (st != null)            jpql.append(" and a.status = :st");

            Query q = em.createQuery(jpql.toString());
            q.setParameter("from", from);
            q.setParameter("to", to);
            if (veterinarianId != null) q.setParameter("vetId", veterinarianId);
            if (st != null)             q.setParameter("st", st);

            Long total = (Long) q.getSingleResult();
            out.put("total", total);
        }

        // ===== byStatus (mapa)
        {
            StringBuilder jpql = new StringBuilder("""
                select a.status, count(a)
                  from Appointment a
                 where a.appointmentDate between :from and :to
            """);
            if (veterinarianId != null) jpql.append(" and a.veterinarian.id = :vetId");
            jpql.append(" group by a.status order by count(a) desc");

            Query q = em.createQuery(jpql.toString());
            q.setParameter("from", from);
            q.setParameter("to", to);
            if (veterinarianId != null) q.setParameter("vetId", veterinarianId);

            Map<String, Long> byStatus = new LinkedHashMap<>();
            for (Object rowObj : q.getResultList()) {
                Object[] row = (Object[]) rowObj;
                AppointmentStatus s = (AppointmentStatus) row[0];
                Long cnt = (Long) row[1];
                byStatus.put(s.name(), cnt);
            }
            out.put("byStatus", byStatus);
        }

        // ===== byAnimalType (lista key/count)
        {
            StringBuilder jpql = new StringBuilder("""
                select coalesce(t.name,'(Nepoznato)'), count(a)
                  from Appointment a
                  join a.pet p
                  left join p.animaltype t
                 where a.appointmentDate between :from and :to
            """);
            if (veterinarianId != null) jpql.append(" and a.veterinarian.id = :vetId");
            if (st != null)             jpql.append(" and a.status = :st");
            jpql.append(" group by t.name order by count(a) desc");

            Query q = em.createQuery(jpql.toString());
            q.setParameter("from", from);
            q.setParameter("to", to);
            if (veterinarianId != null) q.setParameter("vetId", veterinarianId);
            if (st != null)             q.setParameter("st", st);

            List<Map<String, Object>> list = new ArrayList<>();
            for (Object rowObj : q.getResultList()) {
                Object[] row = (Object[]) rowObj;
                String key = (String) row[0];
                Long cnt   = (Long) row[1];
                list.add(Map.of("key", key, "count", cnt));
            }
            out.put("byAnimalType", list);
        }

        // ===== byIntervention (reason) (lista key/count)
        {
            StringBuilder jpql = new StringBuilder("""
                select coalesce(a.reason,'(Nedefinisano)'), count(a)
                  from Appointment a
                 where a.appointmentDate between :from and :to
            """);
            if (veterinarianId != null) jpql.append(" and a.veterinarian.id = :vetId");
            if (st != null)             jpql.append(" and a.status = :st");
            jpql.append(" group by a.reason order by count(a) desc");

            Query q = em.createQuery(jpql.toString());
            q.setParameter("from", from);
            q.setParameter("to", to);
            if (veterinarianId != null) q.setParameter("vetId", veterinarianId);
            if (st != null)             q.setParameter("st", st);

            List<Map<String, Object>> list = new ArrayList<>();
            for (Object rowObj : q.getResultList()) {
                Object[] row = (Object[]) rowObj;
                String key = (String) row[0];
                Long cnt   = (Long) row[1];
                list.add(Map.of("key", key, "count", cnt));
            }
            out.put("byIntervention", list);
        }

        // ===== daily (lista day/count)
        {
            // Ako ti treba specifičan SQL, ovde možeš ubaciti nativeQuery sa date_trunc.
            StringBuilder jpql = new StringBuilder("""
                select FUNCTION('date', a.appointmentDate), count(a)
                  from Appointment a
                 where a.appointmentDate between :from and :to
            """);
            if (veterinarianId != null) jpql.append(" and a.veterinarian.id = :vetId");
            if (st != null)             jpql.append(" and a.status = :st");
            jpql.append(" group by FUNCTION('date', a.appointmentDate) order by 1 asc");

            Query q = em.createQuery(jpql.toString());
            q.setParameter("from", from);
            q.setParameter("to", to);
            if (veterinarianId != null) q.setParameter("vetId", veterinarianId);
            if (st != null)             q.setParameter("st", st);

            List<Map<String, Object>> list = new ArrayList<>();
            for (Object rowObj : q.getResultList()) {
                Object[] row = (Object[]) rowObj;
                Object day = row[0];
                Long cnt = (Long) row[1];
                String dayStr = day instanceof LocalDate ld ? ld.toString() : day.toString();
                list.add(Map.of("day", dayStr, "count", cnt));
            }
            out.put("daily", list);
        }

        return out;
    }
}
