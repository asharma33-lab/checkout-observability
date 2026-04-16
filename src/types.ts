export interface TracingConfig {
  serviceName: string;
  environment: 'development' | 'staging' | 'production';
  otlpEndpoint: string;
  sampleRate: number;
  enableAutoInstrumentation: boolean;
}

export interface CircuitBreakerConfig {
  errorThresholdPercentage: number;
  resetTimeout: number;
  rollingCountTimeout: number;
  volumeThreshold: number;
  fallbackFn?: (error: Error) => unknown;
}

export interface StripeSpanAttributes {
  'stripe.api_version': string;
  'stripe.method': string;
  'stripe.payment_intent_id'?: string;
  'stripe.error_code'?: string;
  'stripe.error_type'?: string;
}
