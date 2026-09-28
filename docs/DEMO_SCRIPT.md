# WHY — 60 to 90-Second Hackathon Judge Demo Script

> **Product Tagline**: *"Remember why. Know when it changes."*

---

### Timing Breakdown (Total Duration: 80–90 Seconds)

| Timeframe | Section | Core Message |
| :--- | :--- | :--- |
| **00:00 – 00:10** | **The Problem** | Software teams keep thousands of Slack messages, Jira tickets, and pull requests—yet when a legacy system causes issues years later, no one remembers *why* it was built that way. Teams maintain obsolete architecture out of fear. |
| **00:10 – 00:20** | **The Question** | Open the **Guided Demo** in WHY. We start with a common fintech question: *"Why did FinFlow choose Provider X for European card payments?"* |
| **00:20 – 00:35** | **Without Hindsight** | Click **Investigate**. In this mode, Hindsight memory recall is completely bypassed. An isolated LLM has no access to organizational history and honestly refuses to hallucinate facts, returning **`INSUFFICIENT EVIDENCE`** with 0 citations. |
| **00:35 – 00:50** | **With Hindsight** | Click **Continue with Hindsight**. Now WHY queries its persistent memory bank `finflow-why`. It recalls 7 authoritative organizational documents and reconstructs the historical decision: Provider X was selected in April 2024 because of French Cartes Bancaires / German Girocard scheme certifications and Apex Retail's legacy ISO 8583 settlement protocol. It cites real sources: **`ADR-014`** and **`PAY-1042`**. |
| **00:50 – 01:10** | **Temporal Reasoning (What Changed)** | Click **Check if those reasons still hold**. This is the core intelligence moment: *"The decision stayed. The assumptions changed."* WHY contrasts the 2024 reasoning against subsequent 2025/2026 events. It discovers that Provider Y obtained Girocard licensing in 2026 and Apex Retail migrated to REST v2. The original assumptions are **`INVALIDATED`**, triggering a **`⚠ REVIEW REQUIRED`** status. |
| **01:10 – 01:25** | **Remember the Investigation** | Click **Remember this investigation**. WHY serializes the entire investigation and persists it back into Hindsight Cloud (`WHY-INV-...`). When subsequent investigations run, this reasoning is recalled as compounding prior AI context, without overriding primary organizational facts. |
| **01:25 – 01:30** | **Conclusion** | *"Most systems remember what happened. WHY remembers why it happened &mdash; and tells you when that reasoning changes."* |

---

### Step-by-Step UI Execution Guide for Presenters

1. **Launch App**: Open `http://localhost:5173` in full screen (or 1920x1080 / 1366x768).
2. **Start Guided Demo**: Click **`Run Guided Demo (60s)`** in the header or the homepage hero section.
3. **Step 01 (Ask)**: Point out the question: *"Why did FinFlow choose Provider X for European card payments?"* Click **`Investigate`**.
4. **Step 02 (Without Memory)**: Point to the `0 Evidence Recalled` and `INSUFFICIENT EVIDENCE` status. Note: *"An honest refusal, not a hallucination."* Click **`Continue with Hindsight`**.
5. **Step 03 (With Hindsight)**: Point to the `7 records recalled` from Hindsight Cloud bank `finflow-why`, the two reconstructed reasons, and the citations (`ADR-014`, `PAY-1042`). Click **`Check if those reasons still hold`**.
6. **Step 04 (What Changed)**: Highlight the 2024 &rarr; 2025 &rarr; 2026 progression, the invalidated assumptions, and the **`⚠ REVIEW REQUIRED`** banner. Click **`Continue to Step 5: Remember`**.
7. **Step 05 (Remember)**: Click **`Remember this investigation`**. Point out the `✓ REMEMBERED IN HINDSIGHT` badge and generated document ID.
8. **Wrap Up**: Show the circular Compounding Decision Loop diagram and deliver the closing tagline.
