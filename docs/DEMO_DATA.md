# WHY — Synthetic Demonstration Dataset: FinFlow

> **Notice**: All records, companies, names, and metrics in this dataset are entirely **synthetic** and designed exclusively for testing and demonstrating WHY's decision reconstruction and temporal invalidation intelligence. No real corporate or customer data is used.

---

## 1. Scenario Background: FinFlow

**FinFlow** is a fictional European fintech scale-up providing payment orchestration and card acquiring services. In early 2024, FinFlow faced a critical architectural dilemma: expanding its acquiring operations across France and Germany while maintaining legacy batch processing requirements for its largest enterprise customer, **Apex Retail**.

The dataset models this decision lifecycle across three distinct chronological eras:
- **Phase 1 (April 2024)**: Evaluation and selection of **Provider X** over alternatives (Provider Y and Provider Z).
- **Phase 2 (2025)**: Operational friction, SLA delays, and technical debt accumulation.
- **Phase 3 (January 2026)**: Invalidation of foundational assumptions through regulatory milestones and client protocol migrations.

---

## 2. Multi-Source Distribution (18 Records Across 5 Source Types)

To model authentic organizational chaos, the justification for selecting Provider X is deliberately distributed across disparate tools rather than unified in a single document:

| Source Type | File Path | Record Count | Core Purpose & Evidence Contained |
| :--- | :--- | :--- | :--- |
| **Architecture Notes (ADR)** | `data/finflow/architecture_notes.json` | 3 | **ADR-014** (Selection of Provider X for European Acquiring), **ARCH-2025-08** (Temporary adapter technical debt review), **ADR-028** (Feasibility assessment for decommissioning Provider X). |
| **Jira Tickets** | `data/finflow/jira.json` | 4 | **PAY-1042** (Provider X evaluation & ISO 8583 settlement requirements), **PAY-1048** (Provider Y Girocard licensing gap), **PAY-2190** (Provider X batch timeout bugs), **PAY-3310** (Apex Retail REST API v2 migration completion). |
| **Slack Conversations** | `data/finflow/slack.json` | 5 | **SLACK-001** (Architecture channel debate on scheme licenses), **SLACK-002** (Vendor negotiation notes on interchange fees), **SLACK-003** (Apex Retail account manager confirms ISO 8583 requirement), **SLACK-004** (Incident war room on settlement delays), **SLACK-005** (Channel announcement: Provider Y obtains BaFin Girocard license). |
| **Incident Reports** | `data/finflow/incidents.json` | 3 | **INC-2024-05** (Initial cutover timeout incident), **INC-2025-11** (Critical 6-hour settlement batch delay), **INC-2025-12** (Post-mortem review on Provider X gateway outages). |
| **Pull Requests** | `data/finflow/pull_requests.json` | 3 | **PR-401** (Provider X adapter implementation), **PR-412** (Temporary ISO 8583 transformation shim), **PR-780** (Feature flag enabling modern REST gateway). |

---

## 3. Chronological Evolution & The Invalidation Arc

```
2024 (DECISION ADOPTION)
├─ ADR-014 & PAY-1042: Provider X selected because:
│   1. Domestic French CB & German Girocard licenses held (Provider Y lacked Girocard).
│   2. Apex Retail demanded ISO 8583 batch compatibility (Provider Z API incompatible).
└─ Result: Rationale is fully justified by constraints.

2025 (OPERATIONAL FRICTION)
├─ INC-2025-11: Provider X misses critical T+1 settlement batch cutoffs.
└─ ARCH-2025-08: Architecture review warns that ISO 8583 shim was meant to be temporary.

2026 (ASSUMPTION INVALIDATION)
├─ SLACK-005: Provider Y secures BaFin Girocard acquiring license. (Assumption 1 Invalidated)
├─ PAY-3310: Apex Retail completes migration to REST API v2. (Assumption 2 Invalidated)
├─ ADR-028: Recommendation to deprecate Provider X in favor of Provider Y.
└─ WHY Result: Status transitions from ACTIVE -> REVIEW REQUIRED.
```

---

## 4. Normalization Pipeline

Raw JSON files in `data/finflow/` are normalized into unified `NormalizedEvent` structures stored in `data/normalized/finflow_events.json` by running:
```bash
python scripts/build_finflow_dataset.py
```
Each normalized event contains:
- `event_id`: Canonical ID (e.g. `ADR-014`, `PAY-1042`, `SLACK-005`)
- `source_type`: `slack`, `jira`, `pull_request`, `incident`, `architecture_note`
- `timestamp`: ISO-8601 UTC timestamp
- `title` & `content`: Authoritative organizational text
- `author`: Organizational stakeholder
- `metadata`: Source-specific fields (e.g. status, tags, channel, issue key)
