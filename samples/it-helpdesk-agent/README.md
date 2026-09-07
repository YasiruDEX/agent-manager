# IT Helpdesk Agent (Demo) - Deployment Guide

## Overview

The IT Helpdesk Agent is a **dummy** L1 IT support assistant used to demo the
Agent Manager chat-agent contract. It has **no LLM, no external API calls, and
reads no environment variables**. Incoming messages are keyword-matched and
answered with canned responses drawn from the static sample data in `data/`.

Because there is nothing to configure, there are no API keys, no secrets, and
no runtime variables to set — it deploys and runs as-is.

## What it answers

| Ask about                                | Example message                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| Greeting / capabilities                  | `Hi, what can you do?`                                                       |
| Password reset (happy path)              | `Hi, I am alice.chen@acmecorp.com, employee ID E-1001. I forgot my password.` |
| Password reset blocked (admin account)   | `Hi, david.kim@acmecorp.com here, employee ID E-1004. Reset my password.`     |
| Known outage                             | `My email is not syncing — is something wrong?`                              |
| Ticket list                              | `Show my tickets, alice.chen@acmecorp.com`                                    |
| Software access                          | `I need access to Figma, bob.martinez@acmecorp.com`                          |
| IT policy                                | `What is the password reset policy?`                                          |
| Escalation                               | `Please escalate this to L2.`                                                 |

Anything else gets a fixed fallback message. All actions are simulated —
nothing is created, reset, or granted.

## Run locally

```bash
pip install -r requirements.txt
python main.py
```

Then:

```bash
curl -s localhost:8000/chat -H 'Content-Type: application/json' -d '{"message":"my email is not syncing","session_id":"s1"}'
```

`GET /health` is available for local checks (AM does not require it).

## Deploy in Agent Manager

### Step 1: Access Agent Manager

1. Navigate to the **Default** project
2. Select **Platform-Hosted Agent** Card
3. Pick **Source Code** as the source type of the agent

### Step 2: Configure Agent Details

| Field                 | Value                                                 |
| --------------------- | ----------------------------------------------------- |
| **Display Name**      | `IT Helpdesk Agent`                                   |
| **Description**       | `Dummy IT helpdesk agent returning canned responses`  |
| **GitHub Repository** | `https://github.com/wso2/agent-manager`               |
| **Branch**            | `main`                                                |
| **App Path**          | `/samples/it-helpdesk-agent`                          |
| **Language**          | `Python`                                              |
| **Language Version**  | `3.11`                                                |
| **Start Command**     | `python main.py`                                      |

### Step 3: Select Agent Interface

- Choose **"Chat Agent"** as the agent interface type

### Step 4: Environment Variables

None. Leave the environment variable section empty — the agent ignores the
environment entirely.

### Step 5: Deploy the Agent

1. Review all configuration details
2. Click **"Deploy"**
3. Wait for the build to complete

## Invoking the Agent

1. Click **"Try It"** on the left navigation
2. Send any of the sample messages from the table above

## Customizing

- **Presentation** (company name, tone, ticket cap): edit `config.py`
- **Response wording and routing**: edit `agent.py`
- **Sample records** (employees, tickets, policies, system status, software
  catalog): edit the JSON files in `data/`
