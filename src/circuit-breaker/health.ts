import type CircuitBreaker from 'opossum';

export interface CircuitBreakerHealthStatus {
  name: string;
  state: 'closed' | 'open' | 'half_open';
  stats: {
    successes: number;
    failures: number;
    rejects: number;
    fires: number;
    timeouts: number;
    fallbacks: number;
  };
}

export function getCircuitBreakerHealth(
  breaker: CircuitBreaker,
  name: string,
): CircuitBreakerHealthStatus {
  const stats = breaker.stats;
  const state = breaker.opened
    ? (breaker.halfOpen ? 'half_open' : 'open')
    : 'closed';

  return {
    name,
    state,
    stats: {
      successes: stats.successes,
      failures: stats.failures,
      rejects: stats.rejects,
      fires: stats.fires,
      timeouts: stats.timeouts,
      fallbacks: stats.fallbacks,
    },
  };
}
