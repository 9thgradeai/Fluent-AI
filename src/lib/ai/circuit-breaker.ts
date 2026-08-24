// Circuit breaker for external service calls.
// Prevents cascading failures when AI providers are unhealthy.

import { createLogger } from "../logging/logger";

const log = createLogger({ component: "circuit-breaker" });

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerOptions {
  /** Number of failures before opening the circuit */
  failureThreshold: number;
  /** Time in ms to wait before trying again */
  resetTimeoutMs: number;
  /** Number of successful calls in half-open state before closing */
  successThreshold?: number;
}

interface CircuitStateData {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  lastStateChange: number;
}

const circuits = new Map<string, CircuitStateData>();

function getState(name: string): CircuitStateData {
  let data = circuits.get(name);
  if (!data) {
    data = {
      state: "closed",
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      lastStateChange: Date.now(),
    };
    circuits.set(name, data);
  }
  return data;
}

export async function circuitBreaker<T>(
  name: string,
  opts: CircuitBreakerOptions,
  fn: () => Promise<T>,
): Promise<T> {
  const data = getState(name);

  // Check if we should transition from open to half-open
  if (data.state === "open") {
    const elapsed = Date.now() - data.lastFailureTime;
    if (elapsed >= opts.resetTimeoutMs) {
      data.state = "half-open";
      data.successCount = 0;
      data.lastStateChange = Date.now();
      log.info("Circuit half-open", { name, elapsed });
    } else {
      throw new Error(`Circuit breaker "${name}" is open. Retry after ${Math.ceil((opts.resetTimeoutMs - elapsed) / 1000)}s.`);
    }
  }

  try {
    const result = await fn();

    // Success: update state
    if (data.state === "half-open") {
      data.successCount++;
      if (data.successCount >= (opts.successThreshold ?? 1)) {
        data.state = "closed";
        data.failureCount = 0;
        data.lastStateChange = Date.now();
        log.info("Circuit closed", { name });
      }
    } else {
      data.failureCount = 0;
    }

    return result;
  } catch (err) {
    // Failure: update state
    data.failureCount++;
    data.lastFailureTime = Date.now();

    if (data.state === "half-open") {
      data.state = "open";
      data.lastStateChange = Date.now();
      log.warn("Circuit reopened from half-open", { name });
    } else if (data.failureCount >= opts.failureThreshold) {
      data.state = "open";
      data.lastStateChange = Date.now();
      log.warn("Circuit opened", { name, failureCount: data.failureCount });
    }

    throw err;
  }
}

export function getCircuitState(name: string): CircuitState {
  return getState(name).state;
}

export function resetCircuit(name: string) {
  circuits.delete(name);
}
