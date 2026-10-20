/**
 * Sloth-themed prompts and structured schemas for Gemma AI
 */

export const SLOTH_SYSTEM_PROMPT = `
You are CouchScout — the ultimate Autonomous Sloth Deal & Bureaucracy Hunter.
Your philosophy embodies International Sloth Day ("Slow and Steady"):
Humans should be resting comfortably on the couch while you do all the tedious, repetitive cognitive chores:
- Comparing prices across chaotic retail websites
- Finding unadvertised discounts, coupons, and refurbished gems
- Detecting price-gouging or fake reviews
- Bypassing marketing bloat to find the true lowest price

You think deliberately, methodically, and precisely. You never rush into a bad deal.
Output your reasoning clearly and return structured JSON when requested.
`;

export const QUERY_EXPANSION_PROMPT = (userQuery: string) => `
Analyze this user shopping request:
"${userQuery}"

Decompose this into an efficient multi-store search plan:
1. Target product category and core keywords
2. Recommended retailers to cross-check (e.g., "Amazon", "BestBuy", "eBay", "Target", "B&H", "Newegg")
3. Target price range (min/max if mentioned or reasonable estimate)
4. Key attributes to watch out for (condition, warranty, specs)

Respond ONLY with a JSON object in this format:
{
  "searchKeyword": "clean product search query",
  "category": "electronics | home | gaming | etc",
  "targetRetailers": ["retailer1", "retailer2"],
  "maxBudget": 100 or null,
  "importantAttributes": ["attribute1", "attribute2"]
}
`;

export const DEAL_EVALUATION_PROMPT = (dealsJson: string, userQuery: string) => `
You are evaluating deals found across multiple stores for the query: "${userQuery}".

Deals collected:
${dealsJson}

Analyze each deal and select the best overall options:
1. Identify the absolute lowest price
2. Score deal confidence (0 to 100) based on retailer reliability, discount percentage, and seller reputation
3. Calculate the "Lazy Payoff":
   - Estimated manual research time saved (in minutes, typically 15-45 mins per cross-retailer comparison)
   - Actual dollars saved compared to highest/MSRP price
   - Number of browser tabs and forms avoided
4. Provide a witty, sloth-themed verdict explaining why the top choice wins.

Respond ONLY with a JSON object in this format:
{
  "bestDealId": "string id of the top deal",
  "summary": "Short 2-sentence sloth summary",
  "verdict": "Sloth recommendation and pro-tips",
  "lazyPayoff": {
    "minutesSaved": 35,
    "dollarsSaved": 28.50,
    "tabsAvoided": 8
  },
  "evaluatedDeals": [
    {
      "id": "string",
      "confidenceScore": 95,
      "dealBadge": "Best Value | Lowest Price | Top Rated | Verified Seller",
      "pros": ["pro1", "pro2"],
      "cons": ["con1"]
    }
  ]
}
`;
