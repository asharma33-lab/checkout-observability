# @vitafleet/checkout-observability

OpenTelemetry distributed tracing, circuit breaker, and structured logging for VitaFleet's checkout-service.

## Overview

This package provides production-ready observability components for the checkout payment flow:

- **Distributed Tracing** — OpenTelemetry SDK with auto-instrumentation for Express and PostgreSQL, plus manual Stripe API spans
- **Circuit Breaker** — `opossum`-based circuit breaker for Stripe API calls with configurable thresholds and telemetry
- **Structured Logging** — Pino logger with automatic trace context injection

## Related

- [RFC: Checkout Service Resilience & Observability](https://one-atlas-qdiv.atlassian.net/wiki/spaces/MD1/pages/42008578)
- [MOBL-56: Add distributed tracing](https://one-atlas-qdiv.atlassian.net/browse/MOBL-56)
- [MOBL-57: Implement circuit breaker](https://one-atlas-qdiv.atlassian.net/browse/MOBL-57)
- [MOBL-54: P1 incident that triggered this work](https://one-atlas-qdiv.atlassian.net/browse/MOBL-54)
