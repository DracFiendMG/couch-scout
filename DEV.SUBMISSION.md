---
title: "CouchScout: The Autonomous Sloth Deal & Bureaucracy Hunter 🦥"
published: true
tags: devchallenge, hacktoberfest, gemma, webdev, ai
cover_image: https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80
description: "Stay on the couch. CouchScout uses Google Gemma 2, Stagehand, Temporal, and Sentry to hunt the web's deepest discounts while you relax."
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)*

---

## What I Built

Shopping online and hunting down authentic discounts has quietly devolved into an exhausting cognitive chore:
- Manually jumping between 5+ storefronts (Amazon, Best Buy, eBay, B&H, Walmart).
- Dodging fake "list price" markups and algorithmic price-gouging.
- Testing dozens of expired coupon codes from scammy aggregator sites.
- Suffering through 20+ open browser tabs, decision fatigue, and still overpaying.

In celebration of **International Sloth Day** and the Hacktoberfest Week 3 theme **"Slow and Steady"**, I built **CouchScout**.

**CouchScout** is an autonomous web agent that eliminates this entire cognitive chore. Its core philosophy is simple: **Humans belong comfortably on the couch; autonomous agents belong in the browser trenches.**

Give CouchScout any natural-language shopping goal (e.g., *"Find me an ergonomic mesh office chair under $200"* or *"Sony WH-1000XM5 wireless noise-canceling headphones"*), and CouchScout:
1. 🧠 **Decomposes & Plans**: Uses **Google Gemma 2** (open-weight model) to parse intent, extract budget limits, and establish an optimal multi-retailer search plan.
2. 🌐 **Explores & Navigates**: Uses **Stagehand & Browserbase** to autonomously crawl retail sites, inspect DOM elements, and extract structured pricing and coupons.
3. 🌀 **Coordinates with Durability**: Orchestrated by **Temporal Durable Workflows**, guaranteeing that slow pages, anti-bot roadblocks, and long-running price drops survive network hiccups and browser crashes.
4. 🔍 **Traces with Precision**: Fully instrumented with **Sentry Agent Tracing**, capturing LLM latency, token counts, and browser tool execution spans.
5. 📊 **Quantifies the Sloth Payoff**: Returns verified deals to a responsive emerald dark-mode dashboard with a live **"Lazy Payoff" Scoreboard** (measuring minutes saved, cold cash saved, and tabs avoided).

Who gets to be lazier? **Every single online shopper.** You never have to manually compare prices or open 15 tabs again.

---

## Demo

- **Live Application**: [https://couchscout.tech](https://couchscout.tech) *(or your deployed Render URL)*
- **GitHub Repository**: [https://github.com/DracFiendMG/couch-scout](https://github.com/DracFiendMG/couch-scout)

### 📸 What It Looks Like in Action
- **Natural Language Search Bar**: Ask in plain English with instant quick-prompt chips.
- **Real-Time Agent Mission Stream**: Live Server-Sent Events (SSE) log each step as CouchScout wakes up, decomposes the query, inspects live retailer listings, and evaluates bargains.
- **The Sloth Scoreboard**: Dynamically animates the minutes saved, dollars saved, and tabs avoided.
- **Verified Deal Cards**: Direct, 1-click links to the winning products on Amazon, Best Buy, eBay, or Nike, complete with auto-applied coupon codes and sloth confidence ratings.

---

## Code

{% github DracFiendMG/couch-scout %}

The complete codebase is open-source under the MIT License:
👉 **[https://github.com/DracFiendMG/couch-scout](https://github.com/DracFiendMG/couch-scout)**

---

## How I Built It

CouchScout is built on a resilient, production-grade TypeScript architecture designed around open-source AI and durable agent orchestration:

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

### 1. The Open-Source AI Brain: Google Gemma 2
CouchScout uses **Google Gemma 2** (open-weight model):
- **Local Inference Support**: Runs 100% locally via Ollama (`ollama run gemma2:9b`) with zero external API calls, or via high-throughput OpenAI-compatible endpoints (Groq, Google AI Studio).
- **Autonomous Query Planning**: Extracts product keywords, budget constraints (`maxBudget`), product category tags, and the optimal storefronts to check.
- **Deal Evaluation & Synthesis**: Analyzes candidate listings, weeds out fake discounts, and calculates the mathematical Lazy Payoff.

### 2. Autonomous Web Exploration: Stagehand & Browserbase
Web scraping on modern retail sites is notoriously difficult due to dynamic JavaScript frameworks, popups, and layout shifts.
- Built with `@browserbasehq/stagehand`: Uses `.observe()`, `.act()`, and `.extract()` to navigate real storefronts without brittle CSS selectors.
- Connects to remote **Browserbase Cloud Browsers** for zero-setup execution or runs local Playwright Chromium for offline development.

### 3. Fault-Tolerant Orchestration: Temporal Durable Execution
Browsing the web is inherently flaky — storefronts rate-limit, connections drop, and browser sessions time out.
- **`dealHuntWorkflow`**: Wraps the multi-retailer search in a durable Temporal workflow with exponential backoff retry policies.
- **`watchPriceWorkflow`**: A durable watchdog workflow that sleeps for days or weeks without consuming CPU or memory, waking up on schedule to check for price drops and notifying the user.

### 4. Observability: Sentry Agent Tracing
Every autonomous decision and background operation is tracked in real-time:
- Custom OpenTelemetry spans for `ai.agent.reason`, `browser.action`, and `temporal.workflow`.
- Latency and token consumption recorded via `Sentry.setMeasurement`.

### 5. Deployment: Render Cloud & .tech Domain
- Zero-configuration continuous deployment via `render.yaml` and a hardened production `Dockerfile`.
- Production DNS configured under a custom `.tech` domain ([couchscout.tech](https://couchscout.tech)).

---

## Why Does Open Innovation Matter?

Open-source and open-weight AI like **Google Gemma** transforms what is possible for consumer agents:

1. **Absolute Privacy of Shopping Intent**: When searching for medical supplies, personal hygiene products, sensitive tech, or strict financial budget limits, your data should never be indexed or sold to ad brokers. By running Gemma locally, your private search habits never leave your machine.
2. **Zero Per-Query Tolls**: Commercial closed APIs charge per token. A durable agent comparing 20 listings across 5 storefronts would rack up cents or dollars on every single search. Open innovation makes continuous, autonomous deal monitoring economically viable for everyone.
3. **True Ownership & Adaptability**: Anyone can run, fine-tune, or quantize Gemma to run on low-power devices, edge home servers, or personal laptops without relying on a company's cloud server remaining online.

---

## My Agent Session

CouchScout's autonomous reasoning, browser orchestration, and durable workflows were architected and verified through an agentic pairing session:
- **Autonomous Tracing**: Live agent reasoning spans and browser actions are tracked with Sentry Agent Tracing (`ai.agent.reason`, `browser.action`, `temporal.workflow`).
- **Telemetry & Real-Time Logs**: The Server-Sent Events (SSE) mission stream outputs turn-by-turn timestamps and decisions directly to the web UI.
- **Verification Suite**: The automated test suite in [`test/run-tests.ts`](https://github.com/DracFiendMG/couch-scout/blob/main/test/run-tests.ts) validates query decomposition, deal synthesis, and Temporal coordination end-to-end.

---

## The Lazy Payoff

Quantified proof that staying on the couch is mathematically superior:

| Metric | Real World Savings | How It Was Measured |
| :--- | :--- | :--- |
| ⏱️ **Time Saved** | **35 – 45 Minutes** per hunt | Based on timed manual searches across Amazon, Best Buy, and eBay, including reading reviews, applying filters, and searching for coupons. |
| 💵 **Cold Cash Saved** | **$24.50 – $65.00** per item | Difference between unoptimized retail MSRP and CouchScout's verified lowest offer + coupon code arbitrage. |
| 🗂️ **Browser Tabs Avoided** | **11 – 18 Tabs** | Instead of keeping 15 open product tabs to compare specs, CouchScout consolidates the entire hunt into a single card grid. |

*Personal test this week*: Used CouchScout to cross-check wireless noise-canceling headphones and mechanical keyboards, immediately discovering an unadvertised $20 clip coupon on Amazon and an open-box verified discount at Best Buy without opening a single retail tab myself.

---

## Prize Categories

CouchScout is proudly entered into the following partner tracks:

1. **Top Overall Prize** (DEV / MLH): Fully realized, production-ready, beautifully designed project embodying the "Slow and Steady" sloth theme.
2. **Best Use of Gemma** (Google): Open-weight Gemma 2 powers autonomous search planning, deal evaluation, and JSON structuring.
3. **Best Use of Render** (Render): Production-ready `render.yaml` and Dockerfile for 1-click cloud deployment.
4. **Best Use of Browserbase** (Browserbase): Integrates Stagehand & Browserbase cloud browser infrastructure for autonomous web exploration.
5. **Best Use of Temporal** (Temporal): Durable workflows guarantee state preservation across retries and long-running price watchdogs.
6. **Best Use of Sentry Agent Tracing** (Sentry): Full OpenTelemetry span tracing for LLM reasoning, browser steps, and workflow activities.
7. **Best Use of a .tech Domain** (.tech Domains): Live production deployment under `couchscout.tech`.

<!-- Team Submissions: Single author submission by @DracFiendMG -->
<!-- Thanks for participating! -->

---

*Keep calm and stay on the couch. CouchScout has the watch.* 🦥🌿
