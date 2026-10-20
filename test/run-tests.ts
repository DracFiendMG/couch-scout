import { gemmaClient } from '../src/ai/gemma-client.js';
import { parsePrice, generateCuratedDeals } from '../src/browser/actions.js';
import { workflowCoordinator } from '../src/workflows/temporal-client.js';

async function runTests() {
  console.log('🧪 Starting CouchScout Verification Tests...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ${testName}`);
      passed++;
    } else {
      console.error(`❌ ${testName}`);
    }
  }

  // Test 1: Price Parsing
  console.log('--- Test Suite 1: Utility & Data Normalization ---');
  assert(parsePrice('$49.99') === 49.99, 'parsePrice should parse standard currency');
  assert(parsePrice('USD 120.50') === 120.5, 'parsePrice should parse currency with prefixes');
  assert(parsePrice(89.0) === 89.0, 'parsePrice should handle raw numbers');

  // Test 2: Deal Generation
  console.log('\n--- Test Suite 2: Deal Engine ---');
  const keyboardDeals = generateCuratedDeals('mechanical keyboard', ['Amazon', 'BestBuy', 'eBay']);
  assert(keyboardDeals.length > 0, 'generateCuratedDeals should generate listings');
  assert(keyboardDeals[0].price > 0, 'Deal price should be greater than zero');
  assert(Boolean(keyboardDeals[0].title), 'Deal should have a product title');

  // Test 3: Gemma Query Planning
  console.log('\n--- Test Suite 3: Gemma AI Planning & Synthesis ---');
  const plan = await gemmaClient.planSearch('hot-swappable keyboard under $70');
  assert(Boolean(plan.searchKeyword), 'Gemma planSearch should return searchKeyword');
  assert(Array.isArray(plan.targetRetailers), 'Gemma planSearch should return targetRetailers array');

  // Test 4: Gemma Deal Evaluation & Lazy Payoff
  const evaluation = await gemmaClient.evaluateDeals(keyboardDeals, 'mechanical keyboard');
  assert(Boolean(evaluation.bestDealId), 'Gemma evaluation should identify bestDealId');
  assert(evaluation.lazyPayoff.minutesSaved > 0, 'Lazy Payoff should calculate minutes saved');
  assert(evaluation.lazyPayoff.tabsAvoided > 0, 'Lazy Payoff should calculate tabs avoided');

  // Test 5: End-to-End Workflow Coordinator
  console.log('\n--- Test Suite 4: End-to-End Resilient Workflow ---');
  const workflowResult = await workflowCoordinator.executeDealHunt('mechanical keyboard under $70');
  assert(workflowResult.deals.length > 0, 'Workflow hunt should return verified deals');
  assert(Boolean(workflowResult.evaluation.summary), 'Workflow hunt should return Gemma evaluation summary');

  console.log(`\n========================================`);
  console.log(`🏁 Test Results: ${passed}/${total} Passed!`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
