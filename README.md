# 🦥 CouchScout

**Autonomous Sloth Deal & Bureaucracy Hunter**  
*Stay on the couch. Let autonomous agents handle the repetitive browsing grind.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Gemma 2](https://img.shields.io/badge/AI%20Brain-Google%20Gemma%202-4285F4?logo=google)](https://ai.google.dev/gemma)
[![Stagehand](https://img.shields.io/badge/Browser-Browserbase%20%2F%20Stagehand-orange)](https://browserbase.com)
[![Temporal](https://img.shields.io/badge/Orchestration-Temporal%20Workflows-000000)](https://temporal.io)
[![Sentry](https://img.shields.io/badge/Observability-Sentry%20Agent%20Tracing-362D59?logo=sentry)](https://sentry.io)
[![Render](https://img.shields.io/badge/Deployment-Render%20Cloud-46E3B7?logo=render)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🛋️ Why CouchScout?

Modern online shopping is an exhausting cognitive tax. Comparing prices across retailers, verifying whether a "50% off sale" is actually just an inflated list price, and hunting coupon codes leaves you with 20 browser tabs and decision fatigue.

**CouchScout** embodies the sloth philosophy: **Humans belong on the couch; autonomous agents belong in the browser trenches.**

Give CouchScout a simple shopping query:
> *"Find me a mechanical keyboard with hot-swappable switches under $70"*

CouchScout will:
1. 🧠 **Decompose & Plan** using **Google Gemma 2** to select candidate storefronts (Amazon, Best Buy, eBay, B&H).
2. 🌐 **Scout & Act** using **Stagehand & Browserbase** to observe live DOMs and extract verified prices & coupons.
3. 🌀 **Survive & Retry** via **Temporal Durable Execution**, ensuring long-running web tasks and price alerts never crash.
4. 🔍 **Trace Spans & Latency** with **Sentry Agent Tracing**.
5. 📊 **Deliver Your Lazy Payoff**: An emerald sloth scoreboard showing minutes saved, cash saved, and tabs avoided!

---

## 🏗️ Architecture

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

---

## 🛠️ Core Technology Stack

CouchScout integrates modern open-source tooling and resilient infrastructure into a unified autonomous pipeline:

| Technology | Role in CouchScout | Key Benefit |
| :--- | :--- | :--- |
| **Google Gemma 2** | Open-weight AI Brain | Runs locally (Ollama) or private cloud; handles intent decomposition and deal evaluation without proprietary lock-in. |
| **Browserbase & Stagehand** | Autonomous Web Exploration | Connects to remote/local browsers to inspect dynamic retail pages (`.act()`, `.observe()`, `.extract()`). |
| **Temporal Workflows** | Durable Execution Engine | Guarantees multi-step browser tasks and price alerts survive network dropouts and browser crashes. |
| **Sentry Agent Tracing** | Full Observability | Instruments agent execution spans, latency measurements, and LLM token usage across the entire pipeline. |
| **Render Cloud & Docker** | Cloud Deployment | Zero-configuration deployment with `render.yaml` and production Docker container. |

---

## 🚀 Quickstart

### 1. Clone & Install
```bash
git clone https://github.com/DracFiendMG/couch-scout.git
cd couch-scout
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(CouchScout includes intelligent fallbacks and sandbox test generators — it works immediately out of the box even before adding external API keys!)*

To enable optional cloud/live integrations:
- **Gemma**: Start Ollama locally (`ollama run gemma2:9b`) or provide a Groq/Google AI Studio key in `GEMMA_API_KEY`.
- **Browserbase**: Add your `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` for cloud browser execution.
- **Sentry**: Add your `SENTRY_DSN` for real-time span tracing.
- **Temporal**: Set `TEMPORAL_ENABLED=true` to connect to a local or cloud Temporal cluster.

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 4. Run Automated Verification Tests
```bash
npm test
```

---

## 🗂️ Project Structure

```
couch-scout/
├── .env.example              # Configuration for Gemma, Browserbase, Temporal, Sentry
├── render.yaml               # 1-Click Render Cloud deployment
├── Dockerfile                # Production Docker container definition
├── docs/
│   └── architecture.md       # Detailed technical architecture guide
├── src/
│   ├── config.ts             # Strongly-typed environment configuration
│   ├── sentry.ts             # Sentry Agent Tracing & Span metrics
│   ├── index.ts              # Express API server & SSE real-time streaming
│   ├── ai/
│   │   ├── gemma-client.ts   # Gemma 2 LLM integration (Ollama / OpenAI-compatible)
│   │   └── prompts.ts        # Sloth-themed prompts and JSON output schemas
│   ├── browser/
│   │   ├── actions.ts        # Deal data models, price normalizers & sandbox data
│   │   └── stagehand-manager.ts # Stagehand & Browserbase browser automation driver
│   ├── workflows/
│   │   ├── activities.ts     # Temporal durable activity functions
│   │   ├── deal-workflows.ts # Temporal workflows (retry, long-running watchdog)
│   │   ├── temporal-client.ts# Workflow coordinator with in-memory fallback
│   │   └── worker.ts         # Temporal Worker process
│   └── public/
│       ├── index.html        # Sloth Dashboard UI
│       ├── style.css         # Emerald dark mode & micro-animations
│       └── app.js            # SSE stream handler & Lazy Payoff scoreboard
└── test/
    └── run-tests.ts          # Comprehensive verification test suite
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

MIT License &copy; 2026 DracFiendMG. Built with 💚 for open-source AI automation. Keep calm and stay on the couch.
