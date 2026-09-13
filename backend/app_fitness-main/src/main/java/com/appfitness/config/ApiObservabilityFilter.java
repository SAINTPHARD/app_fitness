package com.appfitness.config;

import java.io.IOException;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Mede latência e falhas sem registrar query strings, payloads, tokens ou IDs. */
@Component
public class ApiObservabilityFilter extends OncePerRequestFilter {
    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private final MeterRegistry meterRegistry;

    public ApiObservabilityFilter(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        long inicio = System.nanoTime();
        response.setHeader(REQUEST_ID_HEADER, UUID.randomUUID().toString());
        try {
            filterChain.doFilter(request, response);
        } finally {
            String rota = normalizarRota(request.getRequestURI());
            String status = Integer.toString(response.getStatus());
            meterRegistry.timer("systemfitness.http.server.duration",
                    "method", request.getMethod(), "route", rota, "status", status)
                    .record(System.nanoTime() - inicio, TimeUnit.NANOSECONDS);

            String fluxo = identificarFluxo(rota);
            if (response.getStatus() >= 400 && fluxo != null) {
                meterRegistry.counter("systemfitness.flow.failures",
                        "flow", fluxo, "status_family", (response.getStatus() / 100) + "xx").increment();
            }
        }
    }

    static String normalizarRota(String uri) {
        if (uri == null || uri.isBlank()) return "/";
        return uri.toLowerCase(Locale.ROOT)
                .replaceAll("/[0-9a-f]{8}-[0-9a-f-]{27,}(?=/|$)", "/:id")
                .replaceAll("/\\d+(?=/|$)", "/:id");
    }

    private static String identificarFluxo(String rota) {
        if (rota.contains("/auth/login")) return "login";
        if (rota.contains("/onboarding")) return "onboarding";
        if (rota.contains("/refeicoes")) return "refeicao";
        if (rota.contains("/sessoes-treino")) return "treino";
        if (rota.contains("/relatorios")) return "exportacao";
        return null;
    }
}
