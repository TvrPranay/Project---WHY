# WHY — Hackathon Submission Content

---

## 1. Project Name
**WHY — Organizational Decision Memory**

---

## 2. Tagline
**Remember why. Know when it changes.**

---

## 3. One-Line Description
An AI agent that remembers why organizational decisions were made and detects when the assumptions behind them change.

---

## 4. Problem
Modern engineering and product organizations make thousands of consequential architectural and product decisions across disparate channels—Slack discussions, Jira tickets, pull requests, meeting notes, and incident post-mortems. 

While organizations preserve massive volumes of raw text, the **underlying reasoning and trade-offs behind decisions quickly fragment** as engineers rotate and leadership changes. As a result, teams continue maintaining obsolete, high-friction systems out of fear of breaking unknown dependencies, unable to verify whether the original justifications remain valid.

---

## 5. Solution
WHY establishes **Hindsight** as a persistent, temporal organizational memory bank coupled with LLM reasoning. Rather than merely retrieving raw documents, WHY:
- **Recalls organizational evidence** across multiple historical records.
- **Reconstructs the original decision reasoning**, constraints, and rejected alternatives.
- **Identifies verified citations** from primary source documents (e.g., ADRs, tickets).
- **Recalls previous WHY investigations** for compounding institutional context.
- **Compares historical assumptions against subsequent organizational evidence** across time.
- **Detects invalidated constraints** and surfaces decisions that require review (`REVIEW REQUIRED`).
- **Remembers completed investigations** back into Hindsight to inform future reasoning.

---

## 6. Why Hindsight?
Hindsight is not an optional cache or generic retrieval layer in WHY; it is the **foundational persistent memory system**:
1. **Multi-Source Evidence Retention**: Primary organizational records from across the company (Slack, Jira, PRs, ADRs, incidents) are retained in an isolated Hindsight memory bank (`finflow-why`).
2. **Temporal & Entity-Centric Recall**: WHY queries Hindsight to reconstruct what was known and believed at the time a decision was adopted (e.g., April 2024), preserving chronological relationships that flat search cannot capture.
3. **Investigation Retention**: Completed decision investigations are serialized into structured semantic narratives and retained back into Hindsight as `decision_investigation` memories with unique document IDs (`WHY-INV-...`).
4. **Compounding Prior AI Context**: During later inquiries, WHY recalls prior investigation memories alongside primary organizational records.
5. **Strict Epistemic Hygiene**: Primary organizational records remain authoritative bedrock, while prior AI reasoning is treated strictly as non-authoritative historical context.

---

## 7. How It Is Different From RAG
Standard Retrieval-Augmented Generation (RAG) retrieves static text chunks based on surface semantic or keyword similarity to a prompt. It is oblivious to chronological evolution and cannot determine whether an assumption documented in 2024 has been invalidated by an event in 2026.

WHY goes significantly further:
1. **Reconstructs Decision Rationales**: Synthesizes distributed, fragmented evidence across teams and tools into an explicit chain of trade-offs, constraints, and alternatives.
2. **Preserves Reasoning as Memory**: Retains the structured investigation itself into Hindsight as institutional knowledge.
3. **Performs Temporal Invalidation Reasoning**: Systematically compares original gating constraints against newer operational signals.
4. **Detects Assumption Drift**: Surfaces when a decision's underlying justifications no longer hold, transitioning status from `ACTIVE` to `REVIEW REQUIRED`.

---

## 8. How WHY Learns
WHY **does not fine-tune the underlying language model** or alter model weights. 

Instead, WHY "learns" operationally through **persistent memory accumulation in Hindsight**:
- When an investigation concludes, WHY retains a structured semantic memory of the decision, its rationales, invalidated assumptions, and review status in Hindsight.
- On subsequent runs, WHY recalls this earlier reasoning as compounding institutional context.
- To prevent self-reinforcing hallucinations, WHY enforces a strict **Epistemic Hierarchy**:
  $$\text{Primary Organizational Evidence} > \text{Prior AI Reasoning}$$
  Primary source documents always supersede prior AI reasoning. If new organizational evidence contradicts an earlier AI investigation, primary evidence takes precedence and the conflict is highlighted transparently.

---

## 9. Demonstration (FinFlow Scenario)
The demo illustrates a realistic European fintech scenario, **FinFlow**:
- **Investigation Question**: *"Why did FinFlow choose Provider X for European card payments?"*
- **Mode A (Without Hindsight)**: The agent has no persistent organizational memory. It honestly refuses to speculate and returns **`INSUFFICIENT EVIDENCE`** with 0 citations and confidence 0.0.
- **Mode B (With Hindsight)**: Recalls 7 authoritative records from Hindsight Cloud bank `finflow-why`. Reconstructs that Provider X was selected in April 2024 due to French CB / German Girocard domestic acquiring licensing and Apex Retail's legacy ISO 8583 settlement protocol (citing `ADR-014` and `PAY-1042`).
- **Temporal Analysis**: Evaluates subsequent 2025/2026 events. Discovers that Provider Y received Girocard certification (`SLACK-005`) and Apex Retail migrated to REST v2 (`PAY-3310`). Original assumptions are **`INVALIDATED`**, transitioning decision status to **`⚠ REVIEW REQUIRED`**.
- **Memory Retention**: The completed investigation is retained into Hindsight (`WHY-INV-...`), closing the loop.

*(Note: FinFlow is a fictional company and the 18-record dataset is synthetic demonstration data).*

---

## 10. Innovation
The core innovation of WHY is combining three distinct capabilities into a closed loop:
1. **Decision Reasoning Reconstruction**: Transforming fragmented organizational chat, tickets, and notes into structured, cited decision trees.
2. **Temporal Decision Invalidation**: Continuously evaluating historical assumptions against unfolding operational signals to prevent zombie architecture.
3. **Compounding Memory Evolution via Hindsight**: Storing derived decision reasoning back into persistent memory while strictly maintaining epistemic priority for primary evidence.

---

## 11. Technical Architecture
- **Frontend**: React 18, TypeScript 5.4, Vite 5.2, Lucide React icons. Features Normal Investigation Mode, Controlled Comparison View (`MemoryComparison.tsx`), and a 60–90 second Guided Judge Demo (`GuidedDemo.tsx`).
- **Backend**: Python 3.11+, FastAPI (asynchronous REST API), Pydantic v2 domain schemas.
- **Memory Layer**: **Hindsight** via official `hindsight-client` Python SDK connected to Hindsight Cloud (`api.hindsight.vectorize.io`, bank `finflow-why`).
- **LLM Reasoning**: Groq SDK (`llama-3.3-70b-versatile`) with deterministic sampling and offline test fallback.
- **Data**: 18 synthetic FinFlow records across Slack, Jira, PRs, ADRs, and incidents.

---

## 12. Hindsight Before/After Experiment
WHY includes an empirical controlled comparison endpoint (`POST /api/v1/demo/memory-comparison`):
- **Without Memory (`none`)**: Bypasses memory recall entirely. Returns `INSUFFICIENT EVIDENCE`, 0 evidence records, 0 citations, confidence 0.0. Honest refusal without hallucination.
- **With Hindsight (`hindsight`)**: Recalls 7+ records from Hindsight Cloud. Reconstructs French CB / German Girocard scheme compliance and Apex Retail ISO 8583 settlement compatibility with verified citations (`ADR-014`, `PAY-1042`).

---

## 13. Real-World Impact
Potential production applications include:
- **Architectural Decision Governance**: Auditing legacy microservices and adapters to detect when original constraints have elapsed.
- **Vendor & SaaS Evaluation**: Reassessing third-party vendor choices when newer alternatives reach regulatory compliance or lower pricing.
- **Infrastructure Migrations**: Safely deprecating legacy protocols once downstream enterprise clients complete modern API cutovers.
- **Incident Post-Mortem Follow-Through**: Tracking whether temporary operational shims deployed during outages are properly decommissioned.

---

## 14. Limitations
- **Synthetic Dataset**: Tested against 18 synthetic FinFlow records modeling a payment gateway migration.
- **Single Organization Scope**: Demonstration is currently scoped to FinFlow organizational data.
- **LLM Dependency**: Synthesis quality depends on LLM adherence to provided citations.
- **Heuristic Confidence**: Confidence ratings are calculated from evidence density and citation alignment.
- **Cloud Network Dependency**: Cloud memory recall requires network connectivity to Hindsight Cloud.

---

## 15. Future Scope
- **Production Ingestion Connectors**: Live webhook sync for Slack channels, Jira projects, GitHub repositories, and Notion/Confluence workspaces.
- **Multi-Tenant Memory Namespacing**: Partitioning organizational memory banks by engineering domain (e.g. `finflow-core`, `finflow-risk`) with role-based access control.
- **Automated Invalidation Alerts**: Proactive notifications to Architecture Review Boards when high-impact decisions enter `REVIEW REQUIRED`.

---

## 16. Demo Video Description
A 90-second developer walkthrough demonstrating WHY:
1. Posing an architectural query on a 2024 payment vendor decision.
2. Observing an isolated LLM fail with `INSUFFICIENT EVIDENCE`.
3. Reconstructing the decision with citations using Hindsight Cloud persistent memory.
4. Running temporal reasoning to uncover invalidated assumptions and surface `REVIEW REQUIRED`.
5. Retaining the completed investigation back into Hindsight to close the learning loop.

---

## 17. GitHub Description
AI agent that remembers why organizational decisions were made and detects when the assumptions behind them change. Powered by Hindsight persistent memory.

---

## 18. Technologies
Python, FastAPI, Pydantic, HTTPX, Pytest, React, TypeScript, Vite, Hindsight Cloud (`hindsight-client`), Groq (`llama-3.3-70b-versatile`).

---

## 19. Project Structure
```
WHY/
├── backend/          # FastAPI REST API, Services, Schemas, Tests
├── frontend/         # React, TypeScript, Vite UI
├── data/             # Synthetic FinFlow organizational dataset (18 records)
├── docs/             # Architecture, Demo Script, Judge FAQ, Submission docs
├── scripts/          # Ingestion, initialization, and verification CLIs
├── .env.example      # Configuration template with empty placeholders
├── .gitignore        # Security hardened multi-layer exclusions
└── README.md         # Master Hackathon Documentation
```

---

## 20. Team / Credits
[TEAM INFORMATION REQUIRED]
