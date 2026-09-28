# WHY — Hackathon Judge Frequently Asked Questions (FAQ)

---

### Q1. How is this different from standard Retrieval-Augmented Generation (RAG)?
Standard RAG systems treat data as static text chunks retrieved based on surface keyword or embedding similarity. RAG does not understand temporal evolution, chronological precedence, or whether an assumption documented in 2024 was overturned in 2026. WHY uses **Hindsight** as a temporal, entity-aware memory layer that tracks *how* decisions and constraints evolve across time, allowing the system to determine whether an original rationale remains valid or has become obsolete.

---

### Q2. Why is Hindsight necessary instead of a basic vector database (e.g. Pinecone/Chroma)?
Decisions are not isolated documents—they are evolving networks of human consensus, trade-offs, constraints, and dependencies across time. Basic vector stores only measure semantic distance between prompt embeddings and document chunks. Hindsight provides persistent memory banks, entity-centric indexing, temporal tracking, and structured memory retention. Furthermore, Hindsight allows WHY to persist completed investigations into memory and recall prior reasoning alongside primary evidence.

---

### Q3. What exactly is being remembered in Hindsight?
WHY stores two distinct classes of records in Hindsight:
1. **Primary Organizational Evidence**: Historical records across 5 source types (Slack messages, Jira tickets, pull request reviews, incident post-mortems, and architectural decision records).
2. **Decision Investigation Memories**: Structured summaries of completed investigations, capturing the reconstructed decision, verified citations, invalidated assumptions, review status, and timestamp under memory type `decision_investigation`.

---

### Q4. Does WHY fine-tune or train the LLM?
No. WHY does not fine-tune weights or alter model checkpoints. The intelligence is achieved through **persistent memory accumulation in Hindsight** and deterministic reasoning over retrieved historical contexts. This approach is superior for organizational settings because:
- Memory updates are immediate (zero retraining latency).
- Decisions can be inspected with verifiable source provenance and citations.
- Memories can be audited, partitioned by team or bank, and selectively updated.

---

### Q5. How does WHY avoid hallucinating past decisions when no data exists?
WHY enforces strict epistemic grounding. In the absence of evidence (such as during the controlled `without_memory` experiment or for topics without historical records), the system refuses to speculate and returns `INSUFFICIENT EVIDENCE` with a confidence score of `0.0` and zero citations.

---

### Q6. What happens when previous AI reasoning conflicts with new organizational evidence?
WHY enforces a strict **Epistemic Hierarchy**:
$$\text{Primary Organizational Evidence} > \text{Prior AI Reasoning}$$
Primary documents (Slack, Jira, ADRs, Incident logs) are the authoritative bedrock. Prior WHY investigation memories are treated strictly as contextual institutional memory. If a new primary record contradicts an earlier AI assessment, the primary record always supersedes the prior reasoning, and the contradiction is surfaced transparently in the reasoning trail.

---

### Q7. How does the temporal reasoning / invalidation engine work?
1. **Constraint Extraction**: From the reconstructed 2024 decision, WHY extracts the foundational assumptions that justified selecting the vendor (e.g. Provider Y lacked Girocard certification; client Apex Retail required ISO 8583).
2. **Later Signal Recall**: WHY queries Hindsight for records dated *after* the decision (2025–2026).
3. **Comparative Evaluation**: The reasoning engine evaluates each original assumption against later evidence. When facts have changed (e.g. Provider Y received certification; Apex Retail migrated to REST v2), the assumption is marked `INVALIDATED`, transitioning the overall decision status to `REVIEW REQUIRED`.

---

### Q8. Can WHY make or execute decisions automatically?
No. WHY is a decision intelligence and advisory tool, not an autonomous agent that alters production infrastructure. It equips engineering leads, architects, and product managers with the historical context and invalidation signals needed to make informed decommissioning or migration decisions.

---

### Q9. What data is synthetic in this demonstration?
The **FinFlow** dataset (18 records across Slack, Jira, PRs, incidents, and ADRs) is synthetic demonstration data designed to model a realistic payment engineering team. It was intentionally crafted with multi-source consensus, competing vendor trade-offs, downstream enterprise constraints, and subsequent chronological shifts to rigorously test decision reconstruction and invalidation.

---

### Q10. What would production enterprise deployment require?
1. **Ingestion Connectors**: Webhook or periodic sync integrations for enterprise tools (Slack, Jira, GitHub, Notion/Confluence, PagerDuty).
2. **Access Control & Namespacing**: Leveraging Hindsight bank namespaces (e.g., `org-payments`, `org-core-banking`) with team-level role-based access control (RBAC).
3. **Notification Hooks**: Alerting architecture review boards when high-impact decisions transition to `REVIEW REQUIRED`.
