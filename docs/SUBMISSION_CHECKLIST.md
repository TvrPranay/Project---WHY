# WHY — Hackathon Submission Checklist

Use this checklist to track final submission tasks. Items marked with `[x]` have already been verified in the codebase. Items marked with `[ ]` require manual execution or submission platform entry by the user.

---

### 1. REPOSITORY & CODEBASE

- [x] Codebase audited for secrets (zero API keys or credentials committed).
- [x] `.env` and `backend/.env` strictly excluded by `.gitignore`.
- [x] Clean `.env.example` templates created with empty placeholders.
- [x] All 61 backend automated tests passing (`pytest tests/`).
- [x] Frontend builds cleanly with zero TypeScript errors (`npm run build`).
- [x] Master [`README.md`](../README.md) complete, professional, and formatted.
- [x] Comprehensive architectural documentation in [`docs/ARCHITECTURE.md`](ARCHITECTURE.md).
- [ ] Create remote GitHub repository (e.g. `github.com/[user]/why-decision-memory`).
- [ ] Push local project files to GitHub (ensure `.env` remains uncommitted).
- [ ] Verify GitHub repository visibility is Public (or shared with judges).
- [ ] Verify GitHub README renders cleanly with diagrams.

---

### 2. DEMO & LOCAL EXECUTION

- [x] Hindsight Cloud memory bank `finflow-why` initialized and populated.
- [x] Backend starts cleanly on port 8000/8001 via `scripts/run_backend.bat`.
- [x] Frontend starts cleanly on port 5173 via `scripts/run_frontend.bat`.
- [x] `GET /api/health` reports status `ok` and `Hindsight Connected (Version: 0.10.1)`.
- [x] Controlled experiment verified: Without Memory &rarr; `INSUFFICIENT EVIDENCE`.
- [x] Persistent reconstruction verified: With Hindsight &rarr; `DECISION RECONSTRUCTED`.
- [x] Temporal invalidation verified: Detects changed assumptions &rarr; `REVIEW REQUIRED`.
- [x] Memory retention verified: Persists investigation into Hindsight (`WHY-INV-...`).
- [x] 60–90 second Guided Demo (`GuidedDemo.tsx`) verified end-to-end.
- [ ] Record the 60–90 second screen demo following [`docs/FINAL_DEMO_SCRIPT.md`](FINAL_DEMO_SCRIPT.md).
- [ ] Capture the 4 required screenshots following [`docs/SCREENSHOT_PLAN.md`](SCREENSHOT_PLAN.md).
- [ ] Upload demo video to YouTube / Loom / Google Drive (public link).

---

### 3. SUBMISSION FORM FIELDS

Use the prepared answers in [`docs/SUBMISSION_CONTENT.md`](SUBMISSION_CONTENT.md) to fill in submission fields:

- [ ] **Project Name**: `WHY — Organizational Decision Memory`
- [ ] **Tagline**: `Remember why. Know when it changes.`
- [ ] **One-Line Description**: Copied from Section 3 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **Problem Statement**: Copied from Section 4 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **Solution**: Copied from Section 5 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **Why Hindsight?**: Copied from Section 6 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **How It Is Different From RAG**: Copied from Section 7 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **How WHY Learns**: Copied from Section 8 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **Demonstration Narrative**: Copied from Section 9 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **Innovation Explanation**: Copied from Section 10 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **Technical Architecture**: Copied from Section 11 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **Controlled Experiment**: Copied from Section 12 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **Real-World Impact**: Copied from Section 13 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **Limitations**: Copied from Section 14 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **Future Scope**: Copied from Section 15 of `docs/SUBMISSION_CONTENT.md`.
- [ ] **GitHub Repository URL**: `[REQUIRES USER INPUT]`
- [ ] **Live Demo URL** (if hosted): `[REQUIRES USER INPUT]`
- [ ] **Demo Video URL**: `[REQUIRES USER INPUT]`
- [ ] **Team Information / Credits**: `[REQUIRES USER INPUT]`
- [ ] **Upload Screenshots** (4 images): `[REQUIRES USER INPUT]`
- [ ] **Social Media / Article Post** (if required by hackathon track): `[REQUIRES USER INPUT]`
