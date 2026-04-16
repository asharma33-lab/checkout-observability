import CircuitBreaker from 'opossum';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import type { CircuitBreakerConfig } from '../types.js';

const tracer = trace.getTracer('@vitafleet/checkout-observability');

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  errorThresholdPercentage: 50,
  resetTimeout: 30_000,
  rollingCountTimeout: 10_000,
  volumeThreshold: 5,
};

export function createStripeCircuitBreaker<T>(
  action: (...args: unknown[]) => Promise<T>,
  config: Partial<CircuitBreakerConfig> = {},
): CircuitBreaker<unknown[], T> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const breaker = new CircuitBreaker(action, {
    timeout: 15_000,
    errorThresholdPercentage: mergedConfig.errorThresholdPercentage,
    resetTimeout: mergedConfig.resetTimeout,
    rollingCountTimeout: mergedConfig.rollingCountTimeout,
    volumeThreshold: mergedConfig.volumeThreshold,
  });

  breaker.on('open', () => {
    const span = tracer.startSpan('circuit_breaker.state_change');
    span.setAttributes({
      'circuit_breaker.name': 'stripe',
      'circuit_breaker.state': 'open',
    });
    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Circuit opened — Stripe API unhealthy' });
    span.end();
  });

  breaker.on('halfOpen', () => {
    const span = tracer.startSpan('circuit_breaker.state_change');
    span.setAttributes({
      'circuit_breaker.name': 'stripe',
      'circuit_breaker.state': 'half_open',
    });
    span.end();
  });

  breaker.on('close', () => {
    const span = tracer.startSpan('circuit_breaker.state_change');
    span.setAttributes({
      'circuit_breaker.name': 'stripe',
      'circuit_breaker.state': 'closed',
    });
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
  });

  if (mergedConfig.fallbackFn) {
    breaker.fallback(mergedConfig.fallbackFn);
  }

  return breaker;
}
