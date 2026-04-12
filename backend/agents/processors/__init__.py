# backend2/agents2/processors/__init__.py
"""
Processors Module
Imports all processing agents.
"""

from .deduplicator import Deduplicator
from .scorer_tagger import ScorerTagger
from .translator import Translator
from .uploader import FirestoreUploader

__all__ = [
    "Deduplicator",
    "ScorerTagger",
    "Translator",
    "FirestoreUploader"
]