# Synthetic Organizational Data Directory

This directory will store realistic synthetic organizational data for FinFlow, the fictional fintech company used in the WHY hackathon demonstration.

## Planned Data Streams (Phase 2+)

1. **Slack Conversations (`/slack`)**
   - Engineering and product team discussions regarding payment systems, merchant integrations, and legacy gateway deprecation blockers.

2. **Jira Tickets (`/jira`)**
   - Migration epics, bug reports, and dependency blockers related to legacy gateway sunsetting.

3. **Pull Request Discussions (`/pull_requests`)**
   - Technical PR comments detailing merchant backward-compatibility requirements and fallback mechanisms.

4. **Incident Reports (`/incidents`)**
   - Outage post-mortems revealing why the legacy gateway had to be maintained for Tier-1 enterprise merchants.

5. **Architecture Meeting Notes (`/architecture`)**
   - ADRs (Architecture Decision Records) documenting the decision to keep the Legacy Payment Gateway alive and the criteria for eventual deprecation.

## Key Focus Decision:
> *"Why does the Legacy Payment Gateway still exist?"*
> FinFlow maintained the gateway due to a specific dependency (e.g., enterprise client on custom ISO 8583 protocol). Later information will reveal that the client migrated, triggering a `REVIEW REQUIRED` status.
