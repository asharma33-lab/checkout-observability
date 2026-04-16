import { pino } from 'pino';
import { trace, context } from '@opentelemetry/api';

export function createCheckoutLogger(serviceName: string) {
  return pino({
    name: serviceName,
    level: process.env.LOG_LEVEL ?? 'info',
    formatters: {
      log(object) {
        const span = trace.getSpan(context.active());
        if (span) {
          const spanContext = span.spanContext();
          return {
            ...object,
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
            trace_flags: spanContext.traceFlags,
          };
        }
        return object;
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
