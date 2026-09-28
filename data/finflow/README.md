# FinFlow Synthetic Organizational Dataset

This directory contains the synthetic organizational communications, engineering artifacts, operational incident reports, and architecture records for **FinFlow**, a fictional fintech enterprise operating global payments and merchant acquiring.

---

## 1. Scenario Context & The Core Decision

FinFlow maintains a payment processing infrastructure that routes card transactions globally. A critical decision within the organization's architecture is:

> **"Why does FinFlow still use Provider X / the Legacy Payment Gateway for European card payments?"**

Rather than documenting the complete rationale in a single monolithic specification or exposing a hardcoded "ground truth" field, the evidence is realistically distributed across everyday organizational communication channels.

A future autonomous intelligence agent must reconstruct the historical decision by synthesizing signals across teams, systems, and time.

---

## 2. Source Types & Data Distribution

The dataset comprises exactly 18 organizational records across 5 distinct source types:

| Source Type | File | Count | Description |
| :--- | :--- | :---: | :--- |
| **Slack Conversations** | `slack.json` | 5 | Fast-moving team discussions, debates between engineering and product, real-time alerts, and cross-team trade-off negotiations. |
| **Jira Tickets** | `jira.json` | 4 | Formal tracking of evaluations (`PAY-1042`), technical debt implementations (`PAY-1288`), operational SLA escalations (`PAY-2104`), and enterprise client migration milestones (`PAY-3310`). |
| **Pull Request Discussions** | `pull_requests.json` | 3 | Technical reviews on GitHub/GitLab detailing routing implementation (`PR-412`), operational buffering fixes (`PR-685`), and architectural decoupling (`PR-940`). |
| **Incident Reports** | `incidents.json` | 3 | Post-mortems detailing real-world operational friction: concurrency limits (`INC-2024-09`), dropped webhook outages (`INC-2025-03`), and settlement reconciliation breaches (`INC-2025-11`). |
| **Architecture / Decision Notes** | `architecture_notes.json` | 3 | Authoritative ADRs and review minutes: the initial time-bounded decision (`ADR-014`), the 13-month technical debt review (`ARCH-2025-08`), and the Q2 2026 feasibility evaluation (`ADR-028`). |

---

## 3. Temporal Progression (2024 – 2026)

The dataset spans multiple years to demonstrate how justifications evolve, accumulate technical debt, and ultimately become invalid:

### 2024: Historical Context & Decision Formulation
- **Q1 2024 (`PAY-1042`, `SLACK-001`, `ADR-014`)**: European card expansion evaluated against compliance deadlines. Provider X selected due to specific local scheme certifications (Cartes Bancaires in France, Girocard in Germany) and compatibility with existing ISO 8583 settlement infrastructure.
- **Q3–Q4 2024 (`PAY-1288`, `PR-412`, `SLACK-002`, `INC-2024-09`)**: Implementation of the "temporary" `LegacyGatewayAdapter` workaround. First concurrency bottlenecks observed during Black Friday checkout.

### 2025: Operational Drift, SLA Breaches & Workaround Persistence
- **Early–Mid 2025 (`PR-685`, `SLACK-003`, `INC-2025-03`, `PAY-2104`)**: Provider X reliability slips. Repeated webhook drops and delayed settlement (slipping from contracted T+1 to T+3) create operational and financial friction.
- **Late 2025 (`ARCH-2025-08`, `SLACK-004`, `INC-2025-11`)**: Architectural audit identifies the 15-month-old "temporary" workaround as high technical debt. Decommissioning remains blocked by enterprise client Apex Retail's legacy ISO 8583 dependency and lack of certified European alternatives.

### 2026: New Information & Invalidation Triggers
- **Q1–Q2 2026 (`PR-940`, `SLACK-005`, `PAY-3310`, `ADR-028`)**:
  - *New Signal 1*: Provider Y achieves full BaFin / ECB certification for European acquiring with modern REST APIs and lower interchange fees.
  - *New Signal 2*: Apex Retail completes 100% migration to FinFlow REST API v2, eliminating the legacy ISO 8583 socket requirement.
  - *Outcome*: All historical justifications for maintaining Provider X and the Legacy Payment Gateway have dissolved, transitioning the decision status to **REVIEW REQUIRED**.

---

## 4. Evaluated Alternatives

The dataset documents three distinct payment gateways evaluated by FinFlow:

1. **Provider X (Selected)**:
   - *Strengths*: Certified for French Cartes Bancaires (CB) and German Girocard in early 2024; compatible with legacy ISO 8583 settlement flows.
   - *Trade-offs accepted*: Outdated XML/SOAP protocol, higher basis points (+28 bps), batch-oriented processing, rigid connection limits.
2. **Provider Y (Rejected in 2024, Resurfaced in 2026)**:
   - *2024*: Modern REST API, but disqualified because its BaFin banking license was delayed and could not clear local debit schemes without incurring heavy international interchange fees.
   - *2026*: Fully licensed with native CB and Girocard support at 14 bps lower cost.
3. **Provider Z (Rejected)**:
   - *2024*: Competitive processing fees, but disqualified due to lack of synchronous 3DS2 challenge redirection and asynchronous multi-hour webhook latency.

---

## 5. Downstream Dependency Architecture

The decisions surrounding Provider X ripple through a chain of dependent FinFlow services:

```
[Web & Mobile Checkout]
          │
          ▼
[Payment Orchestration Service] ──────────► [Risk & Fraud Engine]
          │
          ▼
[Legacy Payment Gateway Adapter (Provider X)]
          │
          ├───────────────────────────────► [Provider X Frankfurt Gateway]
          │
          ▼
[Webhook Processor Service]
          │
          ▼
[Settlement Reconciliation Service] ─────► [Redis Retry Buffer]
          │
          ▼
[General Ledger & Treasury Operations]
```

Additionally, external enterprise merchant **Apex Retail** maintained a high-volume legacy ISO 8583 socket connection directly coupled to this pipeline until their migration in March 2026.

---

## 6. Embedded Contradictions & Staleness

- **Contractual vs. Actual SLA**: Historical records describe Provider X as delivering contracted T+1 settlement and 99.95% webhook uptime. Subsequent operational tickets and incidents show frequent T+3 settlement delays and dropped webhook storms.
- **Temporary Workaround Lifespan**: Architectural discussions and Jira stories explicitly designated the `LegacyGatewayAdapter` as a "short-term mitigation for Q3 2024". Evidence across 2025 shows it remained in production for over 18 months, causing operational drag.
- **Decommissioning Blockers**: The two primary blockers identified in 2024 (Apex Retail ISO 8583 protocol and Provider Y European certification) are both resolved in 2026 records.
