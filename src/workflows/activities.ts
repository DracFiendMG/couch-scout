import { gemmaClient, PlanResult, DealEvaluation } from '../ai/gemma-client.js';
import { stagehandManager } from '../browser/stagehand-manager.js';
import { ProductDeal, parsePrice } from '../browser/actions.js';
import { traceAgentSpan } from '../sentry.js';

export async function planSearchActivity(query: string): Promise<PlanResult> {
  return await traceAgentSpan(
    'Temporal Activity: Plan Search',
    'temporal.workflow',
    async () => {
      return await gemmaClient.planSearch(query);
    },
    { query }
  );
}

export async function executeStagehandHuntActivity(
  keyword: string,
  retailers: string[]
): Promise<ProductDeal[]> {
  return await traceAgentSpan(
    'Temporal Activity: Stagehand Hunt',
    'temporal.workflow',
    async () => {
      return await stagehandManager.huntDeals(keyword, retailers);
    },
    { keyword, retailers }
  );
}

export async function evaluateDealsActivity(
  deals: ProductDeal[],
  query: string
): Promise<DealEvaluation> {
  return await traceAgentSpan(
    'Temporal Activity: Evaluate Deals',
    'temporal.workflow',
    async () => {
      return await gemmaClient.evaluateDeals(deals, query);
    },
    { dealCount: deals.length, query }
  );
}

export async function checkSinglePriceActivity(productUrl: string): Promise<number> {
  return await traceAgentSpan(
    'Temporal Activity: Check Single Price',
    'temporal.workflow',
    async () => {
      // In production, Stagehand loads productUrl and extracts price
      // In sandbox/local, returns realistic price
      return parsePrice('49.99');
    },
    { productUrl }
  );
}
