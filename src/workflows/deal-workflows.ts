import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from './activities.js';
import type { ProductDeal } from '../browser/actions.js';
import type { DealEvaluation, PlanResult } from '../ai/gemma-client.js';

// Proxy Temporal activities with resilient retry policies
const {
  planSearchActivity,
  executeStagehandHuntActivity,
  evaluateDealsActivity,
  checkSinglePriceActivity,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '3 minutes',
  retry: {
    initialInterval: '2s',
    maximumInterval: '30s',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export interface DealHuntWorkflowResult {
  plan: PlanResult;
  deals: ProductDeal[];
  evaluation: DealEvaluation;
  executionTimeMs: number;
}

/**
 * Main Temporal Durable Workflow: Deal Hunt
 * Guarantees that multi-site agent browsing survives network blips and browser timeouts.
 */
export async function dealHuntWorkflow(query: string): Promise<DealHuntWorkflowResult> {
  const startTime = Date.now();

  // Step 1: Use Gemma to decompose the query into a multi-store search plan
  const plan = await planSearchActivity(query);

  // Step 2: Orchestrate Stagehand to hunt deals across target retailers
  const deals = await executeStagehandHuntActivity(plan.searchKeyword, plan.targetRetailers);

  // Step 3: Run Gemma Deal Evaluation and calculate Lazy Payoff metrics
  const evaluation = await evaluateDealsActivity(deals, query);

  return {
    plan,
    deals,
    evaluation,
    executionTimeMs: Date.now() - startTime,
  };
}

/**
 * Long-Running Temporal Durable Workflow: Watch Price
 * Checks periodically for price drops without keeping an active server thread running.
 */
export async function watchPriceWorkflow(
  productUrl: string,
  targetPrice: number,
  checkIntervalMinutes: number = 60
): Promise<{ reached: boolean; finalPrice: number }> {
  let currentPrice = 999999;
  let attempts = 0;
  const maxAttempts = 24; // e.g. 24 hours of checks

  while (attempts < maxAttempts) {
    attempts++;
    currentPrice = await checkSinglePriceActivity(productUrl);

    if (currentPrice <= targetPrice) {
      return { reached: true, finalPrice: currentPrice };
    }

    // Durable Temporal sleep — does not consume CPU or memory
    await sleep(`${checkIntervalMinutes} minutes`);
  }

  return { reached: false, finalPrice: currentPrice };
}
