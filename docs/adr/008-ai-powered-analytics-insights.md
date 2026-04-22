# ADR 008: AI-Powered Analytics Insights using Gemini

## Status
Accepted

## Context
The "Smart Insights" section on the Analytics page previously relied on hardcoded heuristic rules (e.g., "if wait time > 20 mins, show warning"). While functional, these rules were limited in their ability to correlate multiple data points or provide personalized business advice. We want to leverage Large Language Models (LLMs) to provide deeper, more actionable business intelligence to queue owners.

## Decision
We will implement an AI-powered insight engine using the **Gemini API** (`gemini-1.5-flash`).
1.  **Backend Integration:** A new `/api/queue/analytics/ai-insights` route will aggregate daily metrics and feed them into a structured system prompt for Gemini.
2.  **Model Choice:** Gemini 1.5 Flash is chosen for its low latency and cost-effectiveness for brief analytical tasks.
3.  **Prompt Strategy:** The prompt will enforce a strict JSON response format to ensure the frontend can reliably map text and sentiment (success/warning/info) to the existing UI.
4.  **Fallback Mechanism:** If the AI call fails or rate limits are hit, the system will provide a generic "Gathering data" message rather than crashing the page.

## Consequences
- **Pros:**
    - **Deeper Insights:** AI can identify complex patterns that hardcoded rules might miss.
    - **Premium Experience:** Dynamic, natural language advice makes the dashboard feel more advanced.
    - **Scalability:** New metrics can be added to the prompt without rewriting complex frontend logic.
- **Cons:**
    - **Latency:** The AI section takes 1-3 seconds longer to load than raw data (handled via a specialized loading spinner).
    - **Cost/API Dependency:** Introduces a dependency on an external API and potential costs at scale.
- **Trade-off:** We prioritize high-value, actionable intelligence over sub-second loading for this non-critical section of the dashboard.
