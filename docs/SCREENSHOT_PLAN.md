# WHY — Hackathon Submission Screenshot Plan

To maximize evaluation clarity, capture and submit these **4 high-resolution screenshots** (1920×1080 or 1440×900 recommended).

---

### Screenshot 1: Main Investigation Screen & Product Identity

- **Where to capture**: `http://localhost:5173` on initial load (Normal Mode).
- **What should be visible**:
  - Top navigation bar showing the **WHY** logo, `FinFlow org`, `Hindsight Connected` green status indicator, and `Run Guided Demo` action button.
  - Hero section with the question: *"Why did FinFlow choose Provider X for European card payments?"*.
  - Hero action buttons: `Run Guided Demo (60s)` and `See WHY with and without memory`.
  - Reconstructed decision overview panel showing `DECISION RECONSTRUCTED`, verified citations (`ADR-014`, `PAY-1042`), and the interactive 2024 &rarr; 2025 &rarr; 2026 lifecycle timeline.
- **What should be hidden**:
  - Browser developer console, debug panels, or local file paths.
- **Core message communicated**:
  - Communicates professional UI polish, real Hindsight Cloud connectivity, clear organizational branding, and immediate decision reconstruction with authoritative citations.

---

### Screenshot 2: Controlled Memory Comparison (Without vs With Hindsight)

- **Where to capture**: Click **`See WHY with and without memory`** on the home page or view Step 2 & 3 of the Guided Demo.
- **What should be visible**:
  - The side-by-side comparison cards:
    - **Left (Without Memory)**: Muted amber/slate card showing `0 Evidence Recalled`, status `INSUFFICIENT EVIDENCE`, and the honest refusal message: *"Without organizational memory, WHY cannot reconstruct the historical decision without inventing facts."*
    - **Right (With Hindsight Memory)**: Vibrant blue card showing `7 Evidence Recalled`, `1 Prior Investigation`, `2 Verified Citations`, status `DECISION RECONSTRUCTED`, and key reasons (French CB/Girocard licensing + Apex Retail ISO 8583).
  - The "Why Hindsight Matters" callout and Memory Flow Architecture diagram below the cards.
- **What should be hidden**:
  - Incomplete loading states.
- **Core message communicated**:
  - Proves the scientific before/after contrast: an isolated LLM honestly refuses to fabricate history, while Hindsight enables grounded decision reconstruction.

---

### Screenshot 3: Temporal Decision Invalidation (`REVIEW REQUIRED`)

- **Where to capture**: Step 4 of the Guided Demo (*"The decision stayed. The assumptions changed."*) or after clicking `Check if reasons still hold` in Normal Mode.
- **What should be visible**:
  - Prominent amber banner: **`⚠ REVIEW REQUIRED`**.
  - Supporting text: *"Historical reasoning that once justified this decision has materially changed."*
  - The 2024 &rarr; 2025 &rarr; 2026 temporal progression bar.
  - The two changed assumptions breakdown cards:
    - Original Assumption: Provider Y lacked certification &rarr; New Evidence: Provider Y secured BaFin Girocard license (`SLACK-005`) &rarr; `INVALIDATED (HIGH IMPACT)`.
    - Original Assumption: Apex Retail required ISO 8583 &rarr; New Evidence: Apex Retail migrated to REST v2 (`PAY-3310`) &rarr; `INVALIDATED (HIGH IMPACT)`.
  - The Epistemic Evidence Trail separating Authoritative Primary Evidence from Prior AI Reasoning.
- **What should be hidden**:
  - Overlapping dropdowns or modal overlays.
- **Core message communicated**:
  - The core product innovation: WHY does not just retrieve old documents; it detects when foundational assumptions have lapsed, alerting teams that a decision must be reviewed.

---

### Screenshot 4: Compounding Decision Memory Loop

- **Where to capture**: Step 5 of the Guided Demo or the `Decision Memory & Learning Loop` section in Normal Mode.
- **What should be visible**:
  - The green confirmation banner: **`✓ REMEMBERED IN HINDSIGHT`**.
  - Metadata block showing:
    - `DOCUMENT ID: WHY-INV-...`
    - `MEMORY TYPE: decision_investigation`
    - `CLASSIFICATION: PRIOR AI REASONING (NON-AUTHORITATIVE)`
  - The circular Compounding Organizational Decision Loop architecture diagram:
    `ORGANIZATIONAL EVIDENCE` &rarr; `HINDSIGHT` &rarr; `RECONSTRUCTION` &rarr; `TEMPORAL REASONING` &rarr; `DECISION MEMORY` &rarr; `HINDSIGHT` &circlearrowleft;.
  - Product closing quote: *"WHY doesn't just retrieve the past. It preserves the reasoning that explains it."*
- **What should be hidden**:
  - Empty or un-submitted states.
- **Core message communicated**:
  - Proves that Hindsight is an evolving persistent memory bank: investigations compound over time as prior reasoning context without polluting primary source facts.
