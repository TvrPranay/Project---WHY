# WHY — Final 90-Second Demo Video & Screen Recording Script

> **Target Duration**: 80–90 Seconds  
> **Presenter Tone**: Natural, authentic, developer-to-developer. Confident and clear, avoiding marketing hyperbole.

---

### [00:00 – 00:10] The Problem

**WHAT TO SHOW**:
- Open the browser to the WHY home screen (`http://localhost:5173`).
- Show the clean header displaying `FinFlow org` and `Hindsight Connected`.

**WHAT TO SAY**:
> "Every engineering team stores tickets, Slack threads, pull requests, and architecture notes. But when a legacy system causes issues two years later, nobody remembers *why* it was built that way. People leave, context disappears, and teams keep legacy systems running out of fear of breaking unknown dependencies. We built WHY to solve this."

---

### [00:10 – 00:20] The Question

**WHAT TO SHOW**:
- Click the blue **`Run Guided Demo (60s)`** button in the hero area or top nav.
- Step 1 appears with the question: *"Why did FinFlow choose Provider X for European card payments?"*

**WHAT TO SAY**:
> "Let's run our Guided Demo. We're investigating FinFlow, a European fintech. In 2024, they chose Provider X for card payments. We want to know: why was that decision made, and does that reasoning still hold today?"

---

### [00:20 – 00:35] Without Hindsight

**WHAT TO SHOW**:
- Click **`Investigate`**.
- Loading spinner shows briefly, then Step 2 displays:
  - Header: `WITHOUT HINDSIGHT`
  - `Evidence Recalled: 0`
  - `Status: INSUFFICIENT EVIDENCE`
  - Honest refusal message highlighted in amber.

**WHAT TO SAY**:
> "First, we run the investigation with memory disabled. Notice what happens: an isolated LLM with zero organizational memory doesn't invent facts or hallucinate a fake reason. It honestly returns `INSUFFICIENT EVIDENCE`. Without persistent memory, an AI cannot explain company decisions."

---

### [00:35 – 00:50] With Hindsight

**WHAT TO SHOW**:
- Click **`Continue with Hindsight`**.
- Step 3 loads with real backend data:
  - `Bank: finflow-why`
  - `Primary Evidence Recalled: 7 records`
  - `Status: DECISION RECONSTRUCTED`
  - Decision text and Reason 1 & 2 cards with citation badges (`ADR-014`, `PAY-1042`).

**WHAT TO SAY**:
> "Now, we give WHY its memory by connecting it to Hindsight Cloud. Instantly, WHY recalls 7 historical records from bank `finflow-why`. It reconstructs the decision: FinFlow selected Provider X in April 2024 because of French Cartes Bancaires and German Girocard scheme certifications, and ISO 8583 protocol compatibility for their client Apex Retail. It cites the exact documents: `ADR-014` and `PAY-1042`."

---

### [00:50 – 01:10] Temporal Reasoning (What Changed)

**WHAT TO SHOW**:
- Click **`Check if those reasons still hold`**.
- Step 4 displays:
  - 2024 &rarr; 2025 &rarr; 2026 timeline progression.
  - Large banner: **`⚠ REVIEW REQUIRED`**.
  - Two comparison cards: Original Assumption vs New Evidence.
  - Primary Organizational Evidence vs Prior AI Reasoning section.

**WHAT TO SAY**:
> "Here is the critical intelligence moment: *the decision stayed, but the assumptions changed*. WHY runs temporal reasoning, comparing the 2024 assumptions against later organizational signals. It discovers that in 2026, alternative Provider Y obtained Girocard certification, and client Apex Retail migrated to REST v2. The original constraints are completely invalidated. WHY automatically flags this decision as `REVIEW REQUIRED`."

---

### [01:10 – 01:25] Remember the Investigation

**WHAT TO SHOW**:
- Click **`Continue to Step 5: Remember`**.
- Click the green **`Remember this investigation`** button.
- UI displays:
  - `✓ REMEMBERED IN HINDSIGHT`
  - Document ID: `WHY-INV-...`
  - Compounding Decision Loop diagram.

**WHAT TO SAY**:
> "Finally, we close the loop. We click 'Remember this investigation.' WHY serializes this entire analysis and retains it back into Hindsight as institutional knowledge. Future investigations will recall this prior reasoning, while primary organizational evidence always remains authoritative."

---

### [01:25 – 01:30] Closing Statement

**WHAT TO SHOW**:
- Hover over the Compounding Decision Loop diagram and the tagline in the footer.

**WHAT TO SAY**:
> "Most systems remember what happened. WHY remembers *why* it happened — and tells you when that reasoning changes. Thank you."
