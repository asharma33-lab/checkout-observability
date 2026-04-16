import { describe, it, expect, vi } from 'vitest';
import { createStripeCircuitBreaker } from '../../src/circuit-breaker/stripe.js';

describe('createStripeCircuitBreaker', () => {
  it('should pass through successful calls', async () => {
    const action = vi.fn().mockResolvedValue({ id: 'pi_123', status: 'succeeded' });
    const breaker = createStripeCircuitBreaker(action);

    const result = await breaker.fire();
    expect(result).toEqual({ id: 'pi_123', status: 'succeeded' });
    expect(action).toHaveBeenCalledOnce();
  });

  it('should open circuit after threshold exceeded', async () => {
    const action = vi.fn().mockRejectedValue(new Error('Stripe 500'));
    const breaker = createStripeCircuitBreaker(action, {
      errorThresholdPercentage: 50,
      volumeThreshold: 2,
      rollingCountTimeout: 10_000,
    });

    for (let i = 0; i < 3; i++) {
      try { await breaker.fire(); } catch {}
    }

    expect(breaker.opened).toBe(true);
  });

  it('should use fallback when circuit is open', async () => {
    const action = vi.fn().mockRejectedValue(new Error('Stripe down'));
    const fallback = vi.fn().mockReturnValue({ error: 'service_unavailable', retryAfter: 30 });
    const breaker = createStripeCircuitBreaker(action, {
      errorThresholdPercentage: 50,
      volumeThreshold: 2,
      fallbackFn: fallback,
    });

    for (let i = 0; i < 3; i++) {
      await breaker.fire();
    }

    const result = await breaker.fire();
    expect(fallback).toHaveBeenCalled();
  });
});
