# Nexus Workers - Architecture & Usage

## 📋 Worker Overview

| Worker | Purpose | Trigger |
|--------|---------|---------|
| `ingest_worker.py` | Lightweight ingestion + initial metadata extraction | API endpoint or manual |
| `nexus_processing_worker.py` | Chunking → embeddings → summaries | Scheduled or manual |
| `gcal_token_loader.py` | Maintain Google OAuth token in Supabase | Cron job (hourly) |

---

## 🔧 Worker Details

### 1. `ingest_worker.py`
**Purpose**: Lightweight knowledge ingestion and metadata extraction

**Functions**:
- Accept raw knowledge items via API
- Extract initial metadata (source, client_id, timestamp)
- Store in `knowledge_items` table
- Queue for processing by nexus_processing_worker

**Usage**:
```bash
# Called via API endpoint
POST /api/knowledge/ingest
```

**Key Functions**:
```python
from workers.ingest_worker import IngestWorker, process_message

worker = IngestWorker()
worker.ingest(knowledge_item_data)
```

---

### 2. `nexus_processing_worker.py`
**Purpose**: Advanced processing - chunking, embeddings, and AI-powered summaries

**Pipeline**:
1. **Chunking**: Split large texts into 350-token chunks
2. **Embeddings**: Generate 1536D vectors using `text-embedding-3-small`
3. **Summaries**: Create client summaries using GPT-4o-mini
4. **Storage**: Save chunks to `knowledge_chunks` table with embeddings

**Usage**:
```bash
# Run manually
python workers/nexus_processing_worker.py

# Or schedule via cron
0 */6 * * * cd /path/to/project && python workers/nexus_processing_worker.py
```

**Key Functions**:
```python
- chunk_text(text, max_tokens=350)
- embed_text(text) -> List[float]
- generate_summary(client_id, text) -> str
- process_knowledge_item(item_id)
```

**Environment Variables Required**:
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

---

### 3. `gcal_token_loader.py`
**Purpose**: Maintain Google Calendar OAuth token in Supabase

**Functions**:
- Load existing credentials from Supabase
- Refresh token if expired or expiring soon
- Store updated token in `system_config` table
- Run initial OAuth flow if needed

**Usage**:

**Initial Setup** (run once):
```bash
python workers/gcal_token_loader.py --init
# Follow browser prompt to authorize
```

**Automated Refresh** (cron):
```bash
# Add to crontab
0 * * * * cd /path/to/project && python workers/gcal_token_loader.py
```

**Key Functions**:
```python
- load_credentials_from_supabase() -> Credentials
- save_credentials_to_supabase(creds)
- refresh_token_if_needed() -> bool
- run_initial_oauth_flow() -> Credentials
```

**Environment Variables Required**:
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

Required packages:
- `supabase`
- `openai`
- `tiktoken`
- `python-dotenv`
- `google-auth`
- `google-auth-oauthlib`
- `google-auth-httplib2`
- `google-api-python-client`

### 2. Configure Environment
Create `.env.local` with:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 3. Initialize Google Calendar Token (One-time)
```bash
python workers/gcal_token_loader.py --init
```

### 4. Test Workers
```bash
# Test ingestion
python -c "from workers.ingest_worker import process_message; print('✅ Ingest worker OK')"

# Test processing
python workers/nexus_processing_worker.py

# Test token refresh
python workers/gcal_token_loader.py
```

---

## 📅 Recommended Cron Schedule

```cron
# Process knowledge items every 6 hours
0 */6 * * * cd /workspaces/Avidelta && python workers/nexus_processing_worker.py >> logs/processing.log 2>&1

# Refresh Google Calendar token hourly
0 * * * * cd /workspaces/Avidelta && python workers/gcal_token_loader.py >> logs/gcal_token.log 2>&1
```

---

## 🔍 Monitoring & Debugging

### Check Worker Status
```bash
# Check last processing run
supabase-cli query "SELECT MAX(updated_at) FROM knowledge_chunks"

# Check token status
supabase-cli query "SELECT * FROM system_config WHERE key = 'google_oauth_token'"
```

### View Logs
```bash
tail -f logs/processing.log
tail -f logs/gcal_token.log
```

### Manual Intervention
```bash
# Reprocess a specific knowledge item
python -c "from workers.nexus_processing_worker import process_knowledge_item; process_knowledge_item('item-uuid-here')"

# Force token refresh
python workers/gcal_token_loader.py
```

---

## ⚠️ Important Notes

1. **Token Security**: Google OAuth tokens are stored in Supabase `system_config` table. Ensure proper RLS policies.

2. **Rate Limits**: OpenAI API has rate limits. Processing worker implements backoff.

3. **Chunking**: Default chunk size is 350 tokens. Adjust in `chunk_text()` if needed.

4. **Embeddings**: Using `text-embedding-3-small` (1536D). If changing models, update vector dimensions in database.

5. **Cron Jobs**: Ensure proper PATH and environment variables in crontab.

---

## 🏗️ Database Schema Requirements

### `knowledge_items` Table
```sql
CREATE TABLE knowledge_items (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  source TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  processed BOOLEAN DEFAULT FALSE
);
```

### `knowledge_chunks` Table
```sql
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY,
  knowledge_item_id UUID REFERENCES knowledge_items(id),
  chunk_index INTEGER,
  content TEXT,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ
);
```

### `system_config` Table
```sql
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ
);
```

---

## 📊 Worker Performance Metrics

| Worker | Avg Runtime | Memory Usage | API Calls |
|--------|-------------|--------------|-----------|
| ingest_worker | < 1s | ~50MB | 1 (Supabase) |
| nexus_processing_worker | 5-30s per item | ~200MB | 2+ (OpenAI + Supabase) |
| gcal_token_loader | < 2s | ~30MB | 1-2 (Google + Supabase) |

---

## 🔄 Worker Lifecycle

```
┌─────────────────┐
│  Ingest Worker  │ → New knowledge item
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│ Processing Worker       │
│ 1. Chunk text           │
│ 2. Generate embeddings  │
│ 3. Create summaries     │
│ 4. Store in DB          │
└────────┬────────────────┘
         │
         ↓
┌─────────────────┐
│  Ready for      │
│  Search & RAG   │
└─────────────────┘
```

---

## ✅ Cleanup Summary

**Removed Files**:
- ❌ `nexus_worker.py` (duplicate of nexus_processing_worker.py)

**Current Workers** (Final):
- ✅ `ingest_worker.py` - Ingestion
- ✅ `nexus_processing_worker.py` - Processing
- ✅ `gcal_token_loader.py` - Token management

**Import Paths Updated**:
- ✅ `workers/__init__.py` - Updated documentation
- ✅ No old worker references found in codebase

**Status**: All workers properly organized and documented ✅

