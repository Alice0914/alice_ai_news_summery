# backend2/agents2/collectors/__init__.py
"""
Collectors Module
Imports all news collector agents.
"""

from .anthropic_collector import AnthropicCollector
from .mit_collector import MITCollector
from .nvidia_collector import NVIDIACollector
from .openai_collector import OpenAICollector
from .xai_collector import XAICollector
from .robot_collector import RobotCollector
from .runtime_collector import RuntimeCollector
from .techcrunch_collector import TechCrunchCollector

__all__ = [
    "AnthropicCollector",
    "MITCollector",
    "NVIDIACollector",
    "OpenAICollector",
    "XAICollector",
    "RobotCollector",
    "RuntimeCollector",
    "TechCrunchCollector"
]