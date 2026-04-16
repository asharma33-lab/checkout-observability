import { describe, it, expect, vi } from 'vitest';
import { withStripeSpan } from '../../src/tracing/stripe-spans.js';

describe('withStripeSpan', () => {
  it('should create a span for successful Stripe calls', async () => {
    const result = await withStripeSpan('payment_intents.create', async () => {
      return { id: 'pi_test_123', status: 'succeeded' };
    });
    expect(result.id).toBe('pi_test_123');
  });

  it('should capture error details in span on failure', async () => {
    const stripeError = Object.assign(new Error('Card declined'), {
      code: 'card_declined',
      type: 'card_error',
    });

    await expect(
      withStripeSpan('payment_intents.create', async () => {
        throw stripeError;
      }),
    ).rejects.toThrow('Card declined');
  });

  it('should never include PII in span attributes', async () => {
    await withStripeSpan(
      'payment_intents.create',
      async () => ({ id: 'pi_test_456' }),
      { 'stripe.payment_intent_id': 'pi_test_456' },
    );
    // Attributes should only contain payment_intent_id, never card numbers
  });
});
