# CouchScout: The Autonomous Sloth Deal & Bureaucracy Hunter 🦥

*In celebration of Hacktoberfest Week 3 & International Sloth Day: "Slow and Steady"*

---

## 🛋️ What I Built

Shopping online and finding legitimate deals has devolved into an exhausting cognitive chore:
- Cross-referencing 5+ different storefronts (Amazon, Best Buy, eBay, B&H, Target).
- Dodging fake list prices, inflated MSRPs, and sponsored placement tricks.
- Searching for coupon codes only to find 90% of them expired.
- Suffering from 20 open browser tabs and cognitive fatigue.

In honor of **International Sloth Day** and the Hacktoberfest Week 3 theme **"Slow and Steady"**, I built **CouchScout**.

**CouchScout** is an autonomous web agent that does all the tedious, repetitive browsing grind for you while you remain comfortably reclined on the couch. You provide a natural-language shopping goal (like *"Find me a mechanical keyboard with hot-swappable switches under $70"*), and CouchScout:
1. Decomposes the intent into an optimal multi-retailer search plan using **Google's open-weight Gemma 2**.
2. Deploys headless cloud/local browsers via **Browserbase & Stagehand** to inspect listings, observe page elements, and extract structured pricing.
3. Coordinates durable execution via **Temporal**, making multi-site scrapes and long-running price watchdogs immune to browser crashes and network timeouts.
4. Telemetry and agent execution spans are comprehensively traced using **Sentry Agent Tracing**.
5. Delivers verified, coupon-applied offers directly to an emerald sloth dashboard with a real-time **"Lazy Payoff" Scoreboard** (quantifying minutes saved, dollars saved, and tabs avoided).

---

## 🎬 Demo

- **Live Application**: [https://couchscout.tech](https://couchscout.tech) *(or your deployed Render URL)*
- **GitHub Repository**: [https://github.com/DracFiendMG/couch-scout](https://github.com/DracFiendMG/couch-scout)

---

## 🏗️ Architecture & How I Built It

CouchScout is engineered with a modern, resilient TypeScript architecture designed to stack 6 major Hacktoberfest prize tracks:

```
                     ┌────────────────────────────────────────┐
                     │          Sloth Dashboard (UI)          │
                     │  - Natural Language Deal Prompt        │
                     │  - Real-time SSE Agent Mission Stream  │
                     │  - "Lazy Payoff" Scoreboard            │
                     └──────────────────┬─────────────────────┘
                                        │ REST / SSE Stream
                                        ▼
                     ┌────────────────────────────────────────┐
                     │         CouchScout Core Server         │
                     │        (Node.js / Express / TS)        │
                     └──────────────────┬─────────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            ▼                           ▼                           ▼
 ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
 │  Temporal Workflow  │     │   Gemma AI Engine   │     │ Stagehand &         │
 │  - Durable Search   │◄───►│   (Google Open LLM) │◄───►│ Browserbase         │
 │  - Watchdog Loop    │     │   - Decompose Query │     │   - .observe()      │
 │  - Automatic Retry  │     │   - Synthesize Deal │     │   - .act()          │
 └─────────────────────┘     └─────────────────────┘     └─────────────────────┘
            │                           │                           │
            └───────────────────────────┼───────────────────────────┘
                                        ▼
                     ┌────────────────────────────────────────┐
                     │   Sentry OpenTelemetry Agent Tracing   │
                     │   - Spans, Latencies, & Measurements   │
                     └────────────────────────────────────────┘
```

### 1. The Brain: Google Gemma 2 (Open-Weight Model)
Instead of relying on proprietary closed APIs with recurring fees, CouchScout is driven by **Gemma 2** (running locally on Ollama or via high-throughput endpoints):
- **Query Decomposition**: Extracts clean search terms, filters, and target storefronts.
- **Deal Evaluation**: Assesses seller credibility, checks whether "sales" are actual bargains, and calculates the **Lazy Payoff**.

### 2. The Hands: Stagehand & Browserbase
Modern retail sites are heavily dynamic and filled with popups and dynamic layouts. Using `@browserbasehq/stagehand`:
- Connects to remote cloud browsers on **Browserbase** or local headless engines.
- Uses `.observe()` and `.extract()` to read live pricing nodes and automatically identify discount coupons.

### 3. The Backbone: Temporal Durable Execution
Web scraping is notoriously brittle. WiFi hiccups or rate limits shouldn't kill a deal hunt:
- **`dealHuntWorkflow`**: Orchestrates activities with exponential backoff and persistent state.
- **`watchPriceWorkflow`**: Long-running monitor that sleeps durably for hours or days without consuming server memory.

### 4. Observability: Sentry Agent Tracing
Every autonomous decision is tracked with Sentry:
- Custom spans for `ai.agent.reason`, `browser.action`, and `temporal.workflow`.
- Custom latency and execution measurements via `Sentry.setMeasurement`.

### 5. Deployment: Render & .tech Domains
- Automated cloud deployment using `render.yaml` and a Docker container.
- Custom domain configuration pointing to `couchscout.tech`.

---

## 🦥 The "Lazy Payoff"

CouchScout doesn't just show deals; it quantifies your sloth victory:
- **Minutes Saved**: The time you would have spent clicking through retail search filters, typically 25–45 minutes per product hunt.
- **Cold Cash Saved**: The price difference between the unoptimized list price and CouchScout's verified lowest offer.
- **Tabs Avoided**: An average of 8–15 tabs you didn't have to keep open in Chrome.

---

## 🌍 Why Open Innovation Matters

Open-weight models like **Google Gemma** democratize artificial intelligence. When building autonomous shopping assistants, privacy is paramount:
- Your personal shopping habits and budget constraints stay local to your machine or private cloud.
- Developers aren't subject to per-query token taxes from closed-source providers.
- Gemma's high efficiency allows it to run smoothly on standard developer hardware.

---

## 🏆 Hacktoberfest Prize Stacking Matrix

| Category | Partner | How CouchScout Qualifies |
| :--- | :--- | :--- |
| **Top Overall Prize** | DEV / MLH | Clean, production-grade application perfectly aligned with the Week 3 "Slow and Steady" Sloth theme. |
| **Best Use of Gemma** | Google | Powered by Gemma 2 for autonomous search planning, deal evaluation, and structured JSON extraction. |
| **Best Use of Render** | Render | Production-ready `render.yaml` and Dockerfile for 1-click cloud deployment. |
| **Best Use of Browserbase** | Browserbase | Integrates Stagehand & Browserbase cloud sessions for autonomous web exploration. |
| **Best Use of Temporal** | Temporal | Durable workflows guarantee state preservation across retries and long-running price watches. |
| **Best Use of Sentry Agent Tracing** | Sentry | Full OpenTelemetry span tracing for LLM reasoning, browser steps, and workflow activities. |
| **Best Use of a .tech Domain** | .tech Domains | Production deployment live under `couchscout.tech`. |

---

*Keep calm and stay on the couch. CouchScout has the watch.* 🦥🌿
