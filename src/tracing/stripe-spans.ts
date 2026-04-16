import { trace, SpanStatusCode, type Span } from '@opentelemetry/api';
import type { StripeSpanAttributes } from '../types.js';

const tracer = trace.getTracer('@vitafleet/checkout-observability');

/**
 * Wraps a Stripe API call with an OpenTelemetry span.
 * Captures method, payment intent ID, and error details.
 * PII (card numbers, CVV) is NEVER included in span attributes.
 */
export async function withStripeSpan<T>(
  method: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Partial<StripeSpanAttributes>,
): Promise<T> {
  return tracer.startActiveSpan(`stripe.${method}`, async (span) => {
    try {
      span.setAttributes({
        'stripe.api_version': 'v3',
        'stripe.method': method,
        ...attributes,
      });

      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const err = error as Error & { code?: string; type?: string };
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      });
      span.setAttributes({
        'stripe.error_code': err.code ?? 'unknown',
        'stripe.error_type': err.type ?? 'unknown',
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
