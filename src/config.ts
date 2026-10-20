import dotenv from 'dotenv';
dotenv.config();

export interface Config {
  port: number;
  nodeEnv: string;
  appUrl: string;

  // Gemma AI
  gemma: {
    provider: 'ollama' | 'openai-compatible' | 'gemini';
    model: string;
    baseUrl: string;
    apiKey: string;
  };

  // Browserbase & Stagehand
  browser: {
    browserbaseApiKey?: string;
    browserbaseProjectId?: string;
    headless: boolean;
  };

  // Temporal
  temporal: {
    enabled: boolean;
    address: string;
    namespace: string;
    certPath?: string;
    keyPath?: string;
  };

  // Sentry
  sentry: {
    dsn?: string;
    environment: string;
    tracesSampleRate: number;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  gemma: {
    provider: (process.env.GEMMA_PROVIDER as any) || 'ollama',
    model: process.env.GEMMA_MODEL || 'gemma2:9b',
    baseUrl: process.env.GEMMA_BASE_URL || 'http://localhost:11434/v1',
    apiKey: process.env.GEMMA_API_KEY || '',
  },

  browser: {
    browserbaseApiKey: process.env.BROWSERBASE_API_KEY || undefined,
    browserbaseProjectId: process.env.BROWSERBASE_PROJECT_ID || undefined,
    headless: process.env.STAGEHAND_HEADLESS !== 'false',
  },

  temporal: {
    enabled: process.env.TEMPORAL_ENABLED === 'true',
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    certPath: process.env.TEMPORAL_CERT_PATH || undefined,
    keyPath: process.env.TEMPORAL_KEY_PATH || undefined,
  },

  sentry: {
    dsn: process.env.SENTRY_DSN || undefined,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),
  },
};
