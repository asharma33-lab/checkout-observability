import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { TracingConfig } from '../types.js';

let sdk: NodeSDK | null = null;

export function initTracing(config: TracingConfig): void {
  if (sdk) {
    throw new Error('Tracing already initialized');
  }

  const traceExporter = new OTLPTraceExporter({
    url: `${config.otlpEndpoint}/v1/traces`,
  });

  const metricExporter = new OTLPMetricExporter({
    url: `${config.otlpEndpoint}/v1/metrics`,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 30_000,
  });

  sdk = new NodeSDK({
    serviceName: config.serviceName,
    traceExporter,
    metricReader,
    instrumentations: config.enableAutoInstrumentation
      ? [getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false },
        })]
      : [],
  });

  sdk.start();
}

export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
  }
}
