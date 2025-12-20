import os
import logging
import tiktoken
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv

# ---------------------------------------
# LOGGING CONFIGURATION
# ---------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ---------------------------------------
# ENVIRONMENT
# ---------------------------------------

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)


# ---------------------------------------
# HELPERS
# ---------------------------------------

def count_tokens(text: str, model="gpt-4o-mini"):
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(text))


def chunk_text(text, max_tokens=350):
    words = text.split()
    chunks = []
    current = []

    for w in words:
        current.append(w)
        if len(current) > max_tokens:
            chunks.append(" ".join(current))
            current = []
    if current:
        chunks.append(" ".join(current))
    return chunks


def embed_text(text):
    resp = client.embeddings.create(
        model="text-embedding-3-small",  # 1536 dimensions
        input=text
    )
    return resp.data[0].embedding


def generate_summary(client_id: str):
    """
    Generate an AI-powered summary for all knowledge chunks of a client.
    
    Args:
        client_id: The client UUID to generate summary for
        
    Returns:
        Dict with structured summary fields
    """
    # Fetch all chunks for the client
    chunks = (
        supabase.table("knowledge_chunks")
        .select("content")
        .eq("client_id", client_id)
        .execute()
        .data
    )

    corpus = "\n\n".join(c["content"] for c in chunks)

    logger.info(f"Generating summary for client {client_id} using {len(chunks)} chunks")

    prompt = f"""
    You are the Nexus Intelligence Engine. Summarize all information about this client.

    ### RAW KNOWLEDGE:
    {corpus}

    ### TASK:
    Produce a structured summary with the following fields:
    - Short Summary (3 sentences)
    - Long Summary (5–8 sentences)
    - Key Insights (bulleted list)
    - Next Actions (bulleted list, actionable)
    - Risks (bulleted list)
    - Opportunities (bulleted list)
    - Sentiment (1 word: positive, neutral, or negative)
    - Priority Score (1–10 based on urgency)

    Output in JSON format.
    """

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )

    import json
    return json.loads(resp.choices[0].message.content)


# ---------------------------------------
# PROCESSING PIPELINE
# ---------------------------------------

def process_item(item):
    item_id = item["id"]
    client_id = item["client_id"]
    raw_text = item["raw_text"]

    logger.info(f"Processing item: {item_id}")

    # 1. CHUNKING
    chunks = chunk_text(raw_text)
    logger.info(f"{len(chunks)} chunks generated")

    for idx, chunk in enumerate(chunks):

        # Count tokens
        tokens = count_tokens(chunk)

        # 2. INSERT CHUNK
        chunk_row = (
            supabase.table("knowledge_chunks")
            .insert({
                "item_id": item_id,
                "client_id": client_id,
                "chunk_index": idx,
                "content": chunk,
                "token_count": tokens
            })
            .execute()
        ).data[0]

        chunk_id = chunk_row["id"]
        logger.debug(f"Chunk {idx} saved ({tokens} tokens)")

        # 3. EMBEDDINGS → pgvector table
        embedding = embed_text(chunk)

        (
            supabase.table("knowledge_embeddings")
            .insert({
                "chunk_id": chunk_id,
                "client_id": client_id,
                "embedding": embedding
            })
            .execute()
        )
        logger.debug(f"Embedding stored for chunk {idx}")

        # 4. TOKEN LOGGING (optional - table may not exist)
        # (
        #     supabase.table("token_usage")
        #     .insert({
        #         "client_id": client_id,
        #         "item_id": item_id,
        #         "chunk_id": chunk_id,
        #         "tokens_in": tokens,
        #         "tokens_out": 0,
        #         "model": "text-embedding-3-small"
        #     })
        #     .execute()
        # )

    # 5. MARK AS PROCESSED
    supabase.table("knowledge_items").update({
        "metadata": {
            **item.get("metadata", {}),
            "processed": True
        }
    }).eq("id", item_id).execute()

    # 6. GENERATE AND SAVE SUMMARY
    logger.info(f"Generating summary for client {client_id}")
    summary = generate_summary(client_id)

    supabase.table("client_summaries").upsert({
        "client_id": client_id,
        "short_summary": summary.get("Short Summary"),
        "long_summary": summary.get("Long Summary"),
        "key_insights": "\n".join(summary.get("Key Insights", [])),
        "next_actions": "\n".join(summary.get("Next Actions", [])),
        "risks": "\n".join(summary.get("Risks", [])),
        "opportunities": "\n".join(summary.get("Opportunities", [])),
        "sentiment": summary.get("Sentiment"),
        "priority_score": summary.get("Priority Score"),
    }).execute()

    # Save snapshot to version history
    supabase.table("summary_versions").insert({
        "client_id": client_id,
        "summary_snapshot": summary
    }).execute()

    logger.info(f"Summary updated for client {client_id}")
    logger.info(f"Finished processing item: {item_id}")


# ---------------------------------------
# MAIN LOOP
# ---------------------------------------

def main():
    logger.info("Nexus Ingest Worker Starting...")

    # Pull unprocessed items
    items = (
        supabase.table("knowledge_items")
        .select("*")
        .or_("metadata->>processed.eq.false,metadata->>processed.is.null")
        .execute()
        .data
    )

    logger.info(f"Found {len(items)} items needing processing")

    for item in items:
        process_item(item)

    logger.info("Worker complete")


if __name__ == "__main__":
    main()
