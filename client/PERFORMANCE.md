# Frontend Performance Tracker

This document tracks the frontend performance metrics over time. Our primary goals are to maximize our Lighthouse Performance score and keep our Core Web Vitals strictly in the "Good" range.

### Metrics Guide:
- **Lighthouse:** Overall Performance Score (0-100) from Chrome DevTools (Desktop/Mobile).
- **LCP (Largest Contentful Paint):** Time it takes for the main content to render (Target: < 2.5s).
- **TBT (Total Blocking Time):** How long the UI is blocked from user input (Target: < 200ms).
- **CLS (Cumulative Layout Shift):** Visual stability / how much the layout jumps (Target: < 0.1).
- **Bundle Size:** The total size of the main JS bundle sent to the client.

| Date | Commit / Version | Description of Change | Lighthouse Score | LCP | TBT | CLS | Bundle Size (Gzipped) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
