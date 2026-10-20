import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initSentry, Sentry } from './sentry.js';
import { workflowCoordinator } from './workflows/temporal-client.js';
import { SearchTaskProgress } from './browser/actions.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Sentry Agent Tracing
initSentry();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend assets (robust path for both dev tsx and dist production)
let publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
  publicPath = path.join(process.cwd(), 'src', 'public');
}
app.use(express.static(publicPath));

// In-memory active hunt sessions for SSE streaming
const activeSessions = new Map<
  string,
  {
    listeners: Array<(data: any) => void>;
    history: any[];
  }
>();

// Initialize workflow coordinator
await workflowCoordinator.init();

/**
 * Health & Configuration Status
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    theme: 'Slow and Steady (International Sloth Day)',
    integrations: {
      gemma: {
        provider: config.gemma.provider,
        model: config.gemma.model,
        hasKey: Boolean(config.gemma.apiKey),
      },
      stagehand: {
        browserbaseConfigured: Boolean(config.browser.browserbaseApiKey),
        headless: config.browser.headless,
      },
      temporal: {
        enabled: config.temporal.enabled,
        address: config.temporal.address,
      },
      sentry: {
        enabled: Boolean(config.sentry.dsn),
        environment: config.sentry.environment,
      },
    },
  });
});

/**
 * SSE Endpoint: Stream live agent steps to client
 */
app.get('/api/hunt/stream', (req: Request, res: Response) => {
  const sessionId = (req.query.sessionId as string) || 'default';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!activeSessions.has(sessionId)) {
    activeSessions.set(sessionId, { listeners: [], history: [] });
  }

  const session = activeSessions.get(sessionId)!;

  // Send initial connected ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', sessionId })}\n\n`);

  // Send any existing history
  for (const item of session.history) {
    res.write(`data: ${JSON.stringify(item)}\n\n`);
  }

  const listener = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  session.listeners.push(listener);

  req.on('close', () => {
    session.listeners = session.listeners.filter((l) => l !== listener);
    if (session.listeners.length === 0) {
      setTimeout(() => {
        if (session.listeners.length === 0) {
          activeSessions.delete(sessionId);
        }
      }, 60000);
    }
  });
});

/**
 * Start Autonomous Deal Hunt
 */
app.post('/api/hunt', async (req: Request, res: Response) => {
  const { query, sessionId = 'default' } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid query string.' });
  }

  if (!activeSessions.has(sessionId)) {
    activeSessions.set(sessionId, { listeners: [], history: [] });
  }

  const session = activeSessions.get(sessionId)!;

  const broadcast = (data: any) => {
    session.history.push(data);
    for (const listener of session.listeners) {
      listener(data);
    }
  };

  // Immediate acknowledgement
  res.json({ status: 'started', sessionId, query });

  // Run autonomous workflow asynchronously while streaming progress
  (async () => {
    try {
      broadcast({
        type: 'PROGRESS',
        step: 'Wake Up',
        message: `CouchScout Sloth activated for: "${query}". You can sit back now.`,
        timestamp: new Date().toISOString(),
      });

      const onProgress = (progress: SearchTaskProgress) => {
        broadcast({
          type: 'PROGRESS',
          ...progress,
        });
      };

      const result = await workflowCoordinator.executeDealHunt(query, onProgress);

      broadcast({
        type: 'COMPLETE',
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Hunt execution error:', err);
      broadcast({
        type: 'ERROR',
        error: err.message || 'Deal hunt encountered an issue',
        timestamp: new Date().toISOString(),
      });
    }
  })();
});

// Fallback to index.html for SPA routing
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start Express server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
🦥 ========================================================
   CouchScout Server is Live!
   URL: http://localhost:${PORT}
   Mode: ${config.nodeEnv}
   Theme: "Slow and Steady" (International Sloth Day)
   Prize Stack: Gemma + Stagehand + Temporal + Sentry + Render
🦥 ========================================================
  `);
});
