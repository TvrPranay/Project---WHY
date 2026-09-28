"""Base Agent Interface (Placeholder for future reasoning and invalidation agents)."""

from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseAgent(ABC):
    """Abstract interface for autonomous agents in the WHY decision memory pipeline."""

    @abstractmethod
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute agent workflow."""
        pass
