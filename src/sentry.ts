import * as Sentry from '@sentry/node';
import { config } from './config.js';

let isInitialized = false;

export function initSentry() {
  if (config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      tracesSampleRate: config.sentry.tracesSampleRate,
      release: 'couch-scout@1.0.0',
    });
    isInitialized = true;
    console.log(' [Sentry] Agent Tracing & Performance Monitoring initialized.');
  } else {
    console.log('ℹ [Sentry] Running in local observability mode (SENTRY_DSN not set).');
  }
}

/**
 * Custom wrapper for Sentry Agent Tracing Spans
 */
export async function traceAgentSpan<T>(
  name: string,
  op: 'ai.agent.reason' | 'ai.agent.tool' | 'browser.action' | 'temporal.workflow' | 'deal.scrape',
  fn: () => Promise<T>,
  data?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();

  if (!isInitialized) {
    console.log(`🔍 [Span: ${op}] ${name}`, data ? JSON.stringify(data) : '');
    try {
      const res = await fn();
      const duration = Date.now() - startTime;
      console.log(` [Span Done] ${name} (${duration}ms)`);
      return res;
    } catch (err) {
      console.error(` [Span Error] ${name}:`, err);
      throw err;
    }
  }

  return await Sentry.startSpan(
    {
      name,
      op,
      attributes: {
        'couchscout.version': '1.0.0',
        ...data,
      },
    },
    async (span) => {
      try {
        const result = await fn();
        span.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error: any) {
        span.setStatus({ code: 2, message: error?.message || 'error' });
        Sentry.captureException(error);
        throw error;
      }
    }
  );
}

/**
 * Record LLM Token Usage in Sentry
 */
export function recordLlmMetrics(params: {
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs: number;
}) {
  if (isInitialized) {
    Sentry.setMeasurement('couchscout.llm.latency_ms', params.latencyMs, 'millisecond');
    if (params.totalTokens) {
      Sentry.setMeasurement('couchscout.llm.tokens.total', params.totalTokens, 'none');
    }
  }
}

export { Sentry };
