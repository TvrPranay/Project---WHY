"""Hindsight Persistent Organizational Memory Service.

Connects to Hindsight using the official hindsight-client SDK.
Serves as the genuine long-term organizational memory layer for WHY.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from hindsight_client import Hindsight, RecallResponse, RecallResult
from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.memory.base import BaseMemoryService
from app.schemas.decision import EvidenceItem


class HindsightMemoryService(BaseMemoryService):
    """Production memory service connecting WHY to Hindsight via official SDK."""

    def __init__(self, settings: Optional[Settings] = None) -> None:
        self.settings = settings or get_settings()
        self.base_url = self.settings.HINDSIGHT_BASE_URL.rstrip("/")
        self.api_key = self.settings.HINDSIGHT_API_KEY
        self.default_bank_id = self.settings.HINDSIGHT_BANK_ID
        self._client: Optional[Hindsight] = None

        logger.info(
            "Initialized HindsightMemoryService (Base URL: %s, Default Bank: %s, Auth Configured: %s)",
            self.base_url,
            self.default_bank_id,
            bool(self.api_key),
        )

    def get_client(self) -> Hindsight:
        """Create or return the reused Hindsight client singleton."""
        if self._client is None:
            logger.info("Initializing official Hindsight client connection to %s", self.base_url)
            self._client = Hindsight(
                base_url=self.base_url,
                api_key=self.api_key if self.api_key else None,
                timeout=60.0,
            )
        return self._client

    def check_connection(self) -> Dict[str, Any]:
        """Probe connectivity to Hindsight without raising unhandled exceptions."""
        import httpx
        try:
            headers = {}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            with httpx.Client(timeout=10.0) as client:
                resp = client.get(f"{self.base_url}/version", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    version_str = data.get("api_version") or data.get("version") or "unknown"
                    return {
                        "reachable": True,
                        "configured": True,
                        "base_url": self.base_url,
                        "bank_id": self.default_bank_id,
                        "details": f"Connected to Hindsight (Version: {version_str})",
                    }
                else:
                    return {
                        "reachable": False,
                        "configured": True,
                        "base_url": self.base_url,
                        "bank_id": self.default_bank_id,
                        "details": f"Hindsight returned HTTP {resp.status_code}",
                    }
        except Exception as exc:
            logger.debug("Hindsight connectivity probe failed: %s", exc)
            return {
                "reachable": False,
                "configured": bool(self.base_url),
                "base_url": self.base_url,
                "bank_id": self.default_bank_id,
                "details": f"Connection probe failed: {str(exc)}",
            }

    def ensure_bank_exists(
        self,
        bank_id: Optional[str] = None,
        name: Optional[str] = None,
        mission: Optional[str] = None,
    ) -> bool:
        """Verify that the target memory bank exists in Hindsight, creating it if needed.

        Hindsight create_bank is idempotent or raises if already exists.
        """
        target_bank = bank_id or self.default_bank_id
        client = self.get_client()

        try:
            logger.info("Checking/creating Hindsight memory bank '%s'...", target_bank)
            client.create_bank(
                bank_id=target_bank,
                name=name or f"FinFlow Organizational Memory ({target_bank})",
                mission=mission or (
                    "FinFlow organizational memory: retains engineering decisions, architectural "
                    "constraints, provider evaluations, incident post-mortems, and Jira communications."
                ),
            )
            logger.info("Hindsight bank '%s' created or verified successfully.", target_bank)
            return True
        except Exception as exc:
            # Check if error indicates already exists (common HTTP 409 or conflict response)
            err_msg = str(exc).lower()
            if "already exists" in err_msg or "409" in err_msg or "conflict" in err_msg:
                logger.info("Hindsight bank '%s' already exists.", target_bank)
                return True
            logger.error("Failed to ensure Hindsight bank '%s': %s", target_bank, exc)
            raise

    async def aensure_bank_exists(
        self,
        bank_id: Optional[str] = None,
        name: Optional[str] = None,
        mission: Optional[str] = None,
    ) -> bool:
        """Async verify that target memory bank exists, creating it if needed."""
        target_bank = bank_id or self.default_bank_id
        client = self.get_client()

        try:
            logger.info("Async checking/creating Hindsight memory bank '%s'...", target_bank)
            await client.acreate_bank(
                bank_id=target_bank,
                name=name or f"FinFlow Organizational Memory ({target_bank})",
                mission=mission or (
                    "FinFlow organizational memory: retains engineering decisions, architectural "
                    "constraints, provider evaluations, incident post-mortems, and Jira communications."
                ),
            )
            logger.info("Hindsight bank '%s' created or verified successfully.", target_bank)
            return True
        except Exception as exc:
            err_msg = str(exc).lower()
            if "already exists" in err_msg or "409" in err_msg or "conflict" in err_msg:
                logger.info("Hindsight bank '%s' already exists.", target_bank)
                return True
            logger.error("Failed to ensure Hindsight bank '%s': %s", target_bank, exc)
            raise

    def retain_memory(
        self,
        content: str,
        context: Optional[str] = None,
        document_id: Optional[str] = None,
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict[str, str]] = None,
        tags: Optional[List[str]] = None,
        bank_id: Optional[str] = None,
    ) -> str:
        """Store an organizational record in Hindsight.

        Preserves source traceability via document_id, context, timestamp, and string metadata.
        """
        target_bank = bank_id or self.default_bank_id
        client = self.get_client()

        # Ensure metadata values are strings for SDK compatibility
        safe_metadata: Optional[Dict[str, str]] = None
        if metadata:
            safe_metadata = {str(k): str(v) for k, v in metadata.items()}

        logger.debug(
            "Retaining memory in Hindsight bank '%s' (doc_id=%s, context=%s)",
            target_bank,
            document_id,
            context,
        )

        response = client.retain(
            bank_id=target_bank,
            content=content,
            context=context,
            document_id=document_id,
            timestamp=timestamp,
            metadata=safe_metadata,
            tags=tags,
        )

        return getattr(response, "document_id", document_id or "retained")

    def recall_memories(
        self,
        query: str,
        bank_id: Optional[str] = None,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[EvidenceItem]:
        """Recall relevant organizational memories from Hindsight.

        Maps official SDK RecallResult objects to WHY typed EvidenceItem representations.
        """
        target_bank = bank_id or self.default_bank_id
        client = self.get_client()

        logger.info("Executing Hindsight recall on bank '%s' for query: '%s'", target_bank, query)

        response: RecallResponse = client.recall(
            bank_id=target_bank,
            query=query,
        )
        return self._format_recall_results(response, target_bank, limit)

    async def arecall_memories(
        self,
        query: str,
        bank_id: Optional[str] = None,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[EvidenceItem]:
        """Async recall memories from Hindsight."""
        target_bank = bank_id or self.default_bank_id
        client = self.get_client()

        logger.info("Executing async Hindsight recall on bank '%s' for query: '%s'", target_bank, query)
        response: RecallResponse = await client.arecall(
            bank_id=target_bank,
            query=query,
        )
        return self._format_recall_results(response, target_bank, limit)

    def _format_recall_results(
        self,
        response: RecallResponse,
        target_bank: str,
        limit: int,
    ) -> List[EvidenceItem]:
        """Format RecallResponse results into WHY EvidenceItem models."""
        evidence_items: List[EvidenceItem] = []
        raw_results: List[RecallResult] = getattr(response, "results", []) or []

        for res in raw_results:
            meta = getattr(res, "metadata", {}) or {}
            source_type = meta.get("source_type") or getattr(res, "type", "memory") or "memory"
            doc_id = getattr(res, "document_id", None) or getattr(res, "id", None)
            context = getattr(res, "context", None)

            scores = getattr(res, "scores", None)
            confidence = None
            if scores is not None:
                if hasattr(scores, "final"):
                    confidence = getattr(scores, "final", None)
                elif isinstance(scores, dict):
                    confidence = scores.get("final") or scores.get("relevance") or scores.get("score")

            occurred_at = getattr(res, "occurred_start", None) or getattr(res, "mentioned_at", None)
            if isinstance(occurred_at, str):
                try:
                    occurred_at = datetime.fromisoformat(occurred_at.replace("Z", "+00:00"))
                except Exception:
                    occurred_at = None

            evidence_items.append(
                EvidenceItem(
                    source_type=str(source_type),
                    title=context or f"Memory ({doc_id})",
                    content=getattr(res, "text", "") or str(res),
                    author=meta.get("author"),
                    recorded_at=occurred_at if isinstance(occurred_at, datetime) else None,
                    external_url=doc_id,
                    confidence_score=float(confidence) if confidence is not None else None,
                )
            )

        logger.info("Recalled %d evidence items from Hindsight bank '%s'", len(evidence_items), target_bank)
        return evidence_items[:limit]

    async def aretain_memory(
        self,
        content: str,
        context: Optional[str] = None,
        document_id: Optional[str] = None,
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict[str, str]] = None,
        tags: Optional[List[str]] = None,
        bank_id: Optional[str] = None,
    ) -> str:
        """Async store an organizational record in Hindsight."""
        target_bank = bank_id or self.default_bank_id
        client = self.get_client()

        safe_metadata: Optional[Dict[str, str]] = None
        if metadata:
            safe_metadata = {str(k): str(v) for k, v in metadata.items()}

        response = await client.aretain(
            bank_id=target_bank,
            content=content,
            context=context,
            document_id=document_id,
            timestamp=timestamp,
            metadata=safe_metadata,
            tags=tags,
        )
        return getattr(response, "document_id", document_id or "retained")

    def check_conflicts_or_staleness(
        self,
        new_signal: str,
        decision_id: str,
        bank_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Recall relevant memories and perform comparison against a new signal."""
        target_bank = bank_id or self.default_bank_id
        client = self.get_client()

        # Query relevant historical evidence
        historical = self.recall_memories(
            query=f"Decisions and rationale related to {decision_id} or {new_signal}",
            bank_id=target_bank,
            limit=5,
        )

        return {
            "bank_id": target_bank,
            "decision_id": decision_id,
            "new_signal": new_signal,
            "matched_historical_evidence_count": len(historical),
            "evidence": [item.model_dump() for item in historical],
        }
