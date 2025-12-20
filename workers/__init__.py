"""
Nexus Worker Modules

Worker Responsibilities:
- ingest_worker: Lightweight ingestion + initial metadata extraction
- nexus_processing_worker: Chunking → embeddings → summaries
- gcal_token_loader: Maintain Google OAuth token in Supabase
"""

from .ingest_worker import IngestWorker, process_message

__all__ = ["IngestWorker", "process_message"]
