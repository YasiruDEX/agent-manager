# Event Logistics Agent — Deployment & Developer Guide

## Overview
The Event Logistics Agent is an AI-powered logistics risk assistant that helps event managers assess risk for outdoor events and weddings. Built with LangGraph and FastAPI, the agent automatically resolves venue locations, retrieves accessibility, parking, and hotel density statistics using Google Maps MCP, fetches weather forecasts, and generates a comprehensive risk report for any event venue and date.

---

## Prerequisites
Before running or deploying this agent, ensure you have:

### Required API Keys
- **OpenAI API Key**: For GPT-powered multi-agent decisions.
- **Google Maps API Key**: For Google Maps MCP geocoding, places, and nearby lookup.
- **OpenWeather API Key**: For location-based weather risk forecasting.

---

## Local Development & Testing

### 1. Backend Setup & Run
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Configure your environment variables by copying `.env` and filling in your keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   AGENT_MCP_1_URL=https://mapstools.googleapis.com/mcp
   AGENT_MCP_1_API_KEY=your_google_maps_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key
   ```
3. Run the FastAPI application:
   ```bash
   python main.py
   ```
   The backend server starts at `http://0.0.0.0:9099`.

### 2. Frontend UI Dashboard Setup & Run
The UI client is a React application built with TanStack Start, styled using the WSO2 Oxygen UI components.
To run the UI dev server, simply run the helper script from the agent's root directory:
```bash
./run-ui.sh
```

---

## 1. Deploy in Agent Manager

### Step 1: Access Agent Manager
1. Navigate to the **Default** project.
2. Select **Platform-Hosted Agent Card**.
3. Choose **Source Code** as the source type of the agent.

### Step 2: Configure Agent Details
Fill in the agent creation form with these exact values:

| Field | Value |
| :--- | :--- |
| **Display Name** | Event Logistics Agent |
| **Description** | AI-powered agent for outdoor event & wedding logistics risk assessment |
| **GitHub Repository** | `https://github.com/wso2/agent-manager` |
| **Branch** | `main` |
| **App Path** | `/samples/event-logistics-agent` |
| **Language** | Python |
| **Language Version** | 3.11 |
| **Start Command** | `python main.py` |

### Step 3: Select Agent Interface
Choose **"Chat Agent"** as the agent interface type.

### Step 4: Configure MCP Proxy in Agent Manager
To connect to the Google Maps MCP server, utilize the **MCP Proxies** feature in the Agent Manager:
1. Navigate to **MCP Proxies** in the left sidebar of the Agent Manager dashboard.
2. Click **Create Proxy** and enter:
   - **MCP Proxy Endpoint URL**: `https://mapstools.googleapis.com/mcp`
   - Under **Configure Authentication Header**:
     - **Header**: `X-Goog-Api-Key`
     - **Value**: `<your-google-maps-api-key>`
3. Save the proxy. Go back to your agent configuration form, and under **MCP Proxies**, add the newly created proxy.

This will automatically inject the following environment variables into your agent environment at runtime:
- `AGENT_MCP_1_URL`
- `AGENT_MCP_1_API_KEY`

### Step 5: Configure Environment Variables
Add the remaining environment variables in the create form:
```env
OPENAI_API_KEY=<your-openai-api-key>
OPENWEATHER_API_KEY=<your-openweather-api-key>
```

### Step 6: Deploy the Agent
1. Review all configuration details.
2. Click **"Deploy"**.
3. Wait for the build to complete (typically 6-10 minutes).

---

## 2. Invoking the Agent

### Step 1: Navigate to Chat Interface
Click on the **"Try It"** section on the left navigation of the Agent Manager dashboard.

### Step 2: Test Sample Interactions
Try these sample queries in the chat interface. **Outdoor Event Analysis Query:**
```text
Assess Pelican Hill Resort, Newport Beach for an outdoor wedding on October 14, 2026.
```

---

## 3. Traces
1. Navigate to **Observability > Traces** on the left navigation.
2. Click on a trace to view the node execution sequence:
   - `supervisor_router` parses the prompt.
   - `maps_node` geocodes and resolves hotels/parking/accessibility.
   - `weather_node` fetches OpenWeather data.
   - `risk_analyzer_node` synthesizes the final report.

---

## 4. Evaluators
Evaluators let you assess agent behavior across traces. The **Sequence Adherence** evaluator is ideal for this agent — it verifies that tools and nodes were called in the correct order (e.g., extracting venue data before running risk analysis).

### Step 1: Create an Eval Monitor
1. Go to the agent and click **Monitors** under **Evaluation** in the left navigation.
2. Click **Create Monitor**.
3. Set the title as `Logistics Sequence Eval Monitor`.

### Step 2: Configure Trace Selection
1. Keep **Past Traces** selected.
2. Adjust the time range if needed to include your test traces.
3. Click Next.

### Step 3: Add the Sequence Adherence Evaluator
1. Select the **Sequence Adherence** evaluator.
2. Set the expected sequence: `supervisor_router`, `maps_node`, `weather_node`, `risk_analyzer_node`.
3. Click **Add Evaluator**.

### Step 4: Run the Monitor
1. Wait for the monitor to run against the selected traces.
2. Review the results — traces that successfully completed all pipeline steps in order will score 100%.

---

## 5. LLM Providers & Guardrails
This demonstrates how platform admins can govern agent behavior without changing agent code, using the **Prompt Decorator** guardrail.

Without the guardrail, the agent happily answers off-topic requests like:
```text
Hi, can you write a python script to web scrape a news website?
```

Follow these steps to add a guardrail that restricts the agent to event logistics queries only:

### Step 1: Set the Environment Variable
1. Go to the agent's **Deploy** page.
2. Click **Configure and Deploy**.
3. Add the environment variable `USE_LLM_PROVIDER=true`.
4. Click **Deploy** and wait for the deployment to complete.

### Step 2: Create an LLM Service Provider
1. Navigate to the organization level and select **LLM Service Providers** from the left navigation.
2. Click **Add Service Provider**.
3. Set the name as `openai llm provider` and select **OpenAI** as the provider template.
4. Enter your OpenAI API key and click **Add Provider**.

### Step 3: Add the LLM Provider to the Agent
1. Go to the agent and click **Configure** from the left navigation.
2. Click **Add LLM Provider**.
3. Set the name as `openai gpt` and select the created LLM service provider under the service provider list.

### Step 4: Add the Prompt Decorator Guardrail
1. Click **Add Guardrail** and select **Prompt Decorator**.
2. Under messages, click **+ Add Item** and set:
   - **role**: `system`
   - **content**:
     ```text
     You must ONLY respond to queries related to event logistics, location geocoding,
     weather forecasts, hotel/parking lookups, and risk assessment for venues. For any
     non-logistics/location requests, politely decline and redirect the user.
     ```
3. Leave Json Path empty and Append off.
4. Click **Add**.

### Step 5: Configure Environment Variable References
1. In the LLM provider's **Environment Variables References**, rename the variables:
   - Base URL of the LLM provider → `LLM_PROVIDER_URL`
   - API Key for authentication → `LLM_PROVIDER_KEY`
2. Click **Save**.
3. Wait until the component is deployed with the new configurations.

### Step 6: Test the Guardrail
Try the same off-topic query again in the **Try It** chat interface:
```text
Hi, can you write a python script to web scrape a news website?
```
The agent now declines the off-topic request — the Prompt Decorator guardrail prepends the system message restricting it to event logistics support only, without modifying any agent code.

---

## External Hosting & Instrumentation Guide

If you wish to host the agent externally (outside the platform) and connect it back for observability and tracing, follow these steps to instrument it:

### Step 1: Install AMP Instrumentation Package
Install the AMP instrumentation package in your python environment:
```bash
pip install amp-instrumentation
```
This package provides the ability to instrument your agent and export traces.

### Step 2: Generate API Key
1. Go to settings and generate an API key.
2. Select a Token Duration (e.g., `8760h`).
3. Copy the generated token immediately as it won't be shown again.

### Step 3: Set Environment Variables
Set the agent endpoint and agent-specific API key so traces can be exported securely:
```bash
export AMP_OTEL_ENDPOINT="http://default-default.gateway.localhost:19080/otel"
export AMP_AGENT_API_KEY="<your-generated-amp-agent-api-key>"
```

### Step 4: Run Agent with Instrumentation Enabled
Run your agent's start command wrapped with `amp-instrument`. For example:
```bash
amp-instrument python main.py
```

---

## File Structure

```
event-logistics-agent/
├── main.py                  # Entrypoint runner
├── app.py                   # FastAPI server setup
├── run-ui.sh                # Helper script to run the UI
├── requirements.txt
├── .env
├── openapi.yaml
├── ui/                      # React frontend client
└── agent/                   # LangGraph pipeline components
```
