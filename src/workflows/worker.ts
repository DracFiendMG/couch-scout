import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities.js';
import { config } from '../config.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runWorker() {
  console.log(`🌀 [Temporal Worker] Connecting to Temporal Server at ${config.temporal.address}...`);

  try {
    const connection = await NativeConnection.connect({
      address: config.temporal.address,
    });

    const worker = await Worker.create({
      connection,
      namespace: config.temporal.namespace,
      taskQueue: 'couch-scout-tasks',
      workflowsPath: path.join(__dirname, 'deal-workflows.js'),
      activities,
    });

    console.log(' [Temporal Worker] Listening on task queue "couch-scout-tasks". Ready to hunt deals!');
    await worker.run();
  } catch (err: any) {
    console.error('❌ [Temporal Worker] Failed to start:', err.message);
    process.exit(1);
  }
}

runWorker();
