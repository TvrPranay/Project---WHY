# WHY — Final Hackathon Judge Q&A Guide

---

### 1. What is WHY?
WHY is an organizational decision memory agent. It reconstructs *why* past technical, vendor, and architectural decisions were made, grounds them with verifiable primary source citations, and continuously evaluates whether the original assumptions behind those decisions still remain valid over time.

---

### 2. What problem does it solve?
In modern engineering and product teams, organizational context fragments across Slack channels, Jira boards, pull requests, meeting notes, and incident tickets. As engineers rotate, institutional memory disappears. Teams continue operating and maintaining expensive, high-friction legacy systems out of fear of breaking unknown dependencies. WHY eliminates this fear by making decision provenance transparent and verifiable.

---

### 3. Why is Hindsight necessary?
Decisions are not isolated documents—they are evolving networks of human consensus, trade-offs, constraints, and dependencies formed over time. Standard databases and flat search engines cannot track temporal entity relationships or preserve the continuous evolution of institutional reasoning. Hindsight provides the persistent, temporal memory bank (`finflow-why`) that enables WHY to recall multi-source context from 2024, track updates in 2026, and persist new investigation memories for compounding future intelligence.

---

### 4. How is this different from standard RAG?
A conventional RAG system takes a user query, fetches text snippets with similar embeddings, and generates an answer. It does not understand chronology, decision lifecycles, or constraint invalidation. 
WHY goes much further:
1. It reconstructs the structured decision tree (choices, trade-offs, constraints, citations).
2. It isolates foundational gating assumptions.
3. It performs temporal reasoning by comparing 2024 assumptions against 2025/2026 organizational records.
4. It detects when assumptions have lapsed and transitions decision status to `REVIEW REQUIRED`.
5. It preserves its own investigation reasoning in Hindsight as institutional memory.

---

### 5. What exactly does the agent remember?
WHY stores and retrieves two distinct classes of records in Hindsight:
- **Primary Organizational Evidence**: Historical records (Slack messages, Jira tickets, PR reviews, incident post-mortems, and Architecture Decision Records).
- **Decision Investigation Memories**: Structured summaries of completed investigations (decision statement, verified citations, invalidated assumptions, review status, and timestamp) stored under memory type `decision_investigation` with unique document IDs (`WHY-INV-...`).

---

### 6. Does the model get fine-tuned?
No. The underlying language model (Groq `llama-3.3-70b-versatile`) is not fine-tuned or retrained. Its weights remain untouched. Instead, WHY "learns" operationally by accumulating persistent decision reasoning memories in Hindsight. This ensures instant updates, zero training costs, strict auditability, and no risk of catastrophic forgetting.

---

### 7. How do you prevent hallucinated historical decisions?
WHY enforces strict epistemic grounding. If no organizational memory exists (as demonstrated in our controlled without-memory mode), WHY does not speculate or guess. It returns `status: INSUFFICIENT EVIDENCE`, confidence score `0.0`, zero citations, and an honest refusal explaining that no organizational memory exists for that topic.

---

### 8. What happens when new evidence conflicts with old reasoning?
WHY enforces a strict **Epistemic Hierarchy**:
$$\text{Primary Organizational Evidence} > \text{Prior AI Reasoning}$$
Authoritative primary records (Slack, Jira, ADRs, Incident logs) always supersede prior AI reasoning. If a subsequent primary document indicates that a previous assumption was wrong or has changed, the primary evidence takes precedence, the prior AI reasoning is downgraded, and the contradiction is surfaced transparently.

---

### 9. What happens without Hindsight?
Without Hindsight, the reasoning agent operates in ephemeral mode with zero organizational memory. When asked why a 2024 decision was made, it has no access to the company's internal Slack threads or Jira tickets. It truthfully reports `INSUFFICIENT EVIDENCE`, proving that persistent organizational memory is essential for decision reconstruction.

---

### 10. Why is temporal reasoning important?
A decision that was completely correct and rational in 2024 may become obsolete or harmful by 2026. For example, selecting a payment provider because alternatives lacked domestic scheme licensing is sound—until an alternative acquires that license. Without temporal reasoning, organizations maintain legacy constraints long after the constraints have expired.

---

### 11. What is the role of prior AI reasoning?
When WHY completes an investigation, it stores the derived analysis back into Hindsight. In future investigations, this earlier reasoning is recalled to provide continuity (e.g., recognizing that this decision was investigated 3 months ago and flagged for review). However, it is explicitly tagged as `Prior AI reasoning (context only)` so that it can never be mistaken for primary source truth.

---

### 12. What is synthetic in this project?
The **FinFlow** dataset (18 records across Slack, Jira, PRs, incidents, and ADRs) is synthetic demonstration data. It was carefully crafted to simulate an authentic fintech scale-up navigating European card acquiring, vendor evaluation, and downstream client migrations across 2024–2026. No real corporate or customer data is used.

---

### 13. What would production deployment require?
1. **Tool Connectors**: Webhooks or polling sync integrations for Slack channels, Jira projects, GitHub pull requests, and Confluence spaces.
2. **Access Control & Multi-Tenancy**: Partitioning Hindsight memory banks by engineering domain (e.g., `org-payments`, `org-core-banking`) with team-level role-based access control (RBAC).
3. **Proactive Alerts**: Webhook notifications sending `REVIEW REQUIRED` alerts to Slack or Jira when high-impact decisions become stale.

---

### 14. Can WHY automatically change a company's decision?
No. WHY is a decision intelligence and advisory tool, not an autonomous agent that mutates production code or reconfigures infrastructure. It empowers human engineering leaders, architects, and product managers with the facts and invalidation signals needed to make informed choices.

---

### 15. What is the most innovative part of the project?
The most innovative aspect is the **closed compounding decision loop**:
`Organizational Evidence` &rarr; `Decision Reconstruction` &rarr; `Temporal Invalidation` &rarr; `Decision Memory` &rarr; `Hindsight Persistence`.
Most enterprise AI tools only answer *what* happened in a single document. WHY reconstructs *why* a decision occurred across time, detects when that reasoning changes, and preserves its own findings as persistent memory for future institutional continuity.
