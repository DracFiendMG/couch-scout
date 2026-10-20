import { config } from '../config.js';
import { v4 as uuidv4 } from 'uuid';
import { DealHuntWorkflowResult } from './deal-workflows.js';
import {
  planSearchActivity,
  executeStagehandHuntActivity,
  evaluateDealsActivity,
} from './activities.js';
import { SearchTaskProgress } from '../browser/actions.js';

export class WorkflowCoordinator {
  private isTemporalEnabled: boolean;
  private client: any = null;

  constructor() {
    this.isTemporalEnabled = config.temporal.enabled;
  }

  async init() {
    if (this.isTemporalEnabled) {
      try {
        const { Connection, Client } = await import('@temporalio/client');
        const connection = await Connection.connect({
          address: config.temporal.address,
        });
        this.client = new Client({
          connection,
          namespace: config.temporal.namespace,
        });
        console.log(`🌀 [Temporal] Connected to Temporal Server at ${config.temporal.address}`);
      } catch (err: any) {
        console.warn(`⚠️ [Temporal] Failed to connect (${err.message}). Using resilient in-memory workflow runner.`);
        this.isTemporalEnabled = false;
      }
    } else {
      console.log('ℹ [Temporal] Operating in resilient in-memory workflow mode (TEMPORAL_ENABLED=false).');
    }
  }

  /**
   * Dispatches and tracks a Deal Hunt execution
   */
  async executeDealHunt(
    query: string,
    onProgress?: (progress: SearchTaskProgress) => void
  ): Promise<DealHuntWorkflowResult> {
    const workflowId = `deal-hunt-${uuidv4()}`;

    // If connected to live Temporal server:
    if (this.isTemporalEnabled && this.client) {
      try {
        onProgress?.({
          step: 'Temporal Queue',
          status: 'in_progress',
          message: `Dispatched durable workflow to Temporal task queue "couch-scout-tasks" (ID: ${workflowId})...`,
          timestamp: new Date().toISOString(),
        });

        const handle = await this.client.workflow.start('dealHuntWorkflow', {
          taskQueue: 'couch-scout-tasks',
          workflowId,
          args: [query],
        });

        const result = (await handle.result()) as DealHuntWorkflowResult;
        return result;
      } catch (err: any) {
        console.warn(`⚠️ [Temporal] Cloud execution failed: ${err.message}. Retrying via in-memory workflow runner...`);
      }
    }

    // Resilient in-memory workflow runner (executes activities with identical lifecycle and progress reporting)
    const startTime = Date.now();

    onProgress?.({
      step: 'Decomposition',
      status: 'in_progress',
      message: 'Gemma 2 is analyzing product semantics & building cross-retailer search plan...',
      timestamp: new Date().toISOString(),
    });

    const plan = await planSearchActivity(query);

    onProgress?.({
      step: 'Plan Established',
      status: 'completed',
      message: `Search plan ready: Targeting ${plan.targetRetailers.join(', ')} for "${plan.searchKeyword}".`,
      timestamp: new Date().toISOString(),
    });

    // Execute Stagehand hunting activity with live progress updates
    const { stagehandManager } = await import('../browser/stagehand-manager.js');
    const deals = await stagehandManager.huntDeals(plan.searchKeyword, plan.targetRetailers, onProgress);

    onProgress?.({
      step: 'Deal Evaluation',
      status: 'in_progress',
      message: 'Gemma 2 is evaluating seller credibility, historic pricing, and calculating Lazy Payoff...',
      timestamp: new Date().toISOString(),
    });

    const evaluation = await evaluateDealsActivity(deals, query);

    onProgress?.({
      step: 'Completed',
      status: 'completed',
      message: `Complete! Top deal identified. Lazy Payoff: $${evaluation.lazyPayoff.dollarsSaved} & ${evaluation.lazyPayoff.minutesSaved} minutes saved.`,
      timestamp: new Date().toISOString(),
    });

    return {
      plan,
      deals,
      evaluation,
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const workflowCoordinator = new WorkflowCoordinator();
