<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cc11937e-f9f2-4102-8576-e48360e7ecd5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app and provide your BYOK Gemini key in the estimator UI.
3. Run the app:
   `npm run dev`

## Netlify AI Endpoints and Env Vars
- No server-side Netlify AI function is configured; estimator runs in BYOK mode in-browser.
- Required env vars: none for AI runtime (user supplies Gemini key in UI).
- Key handling: user key is kept in memory for the current tab session only.
- Shared/hosted API keys are intentionally not supported at this stage.
