// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';

// This route handles initial ingestion: raw text → knowledge_items
export async function GET() {
  return NextResponse.json({ message: "Ingest route active" });
}

export async function POST(req: Request) {
  try {
    const { client_id, source, text, metadata } = await req.json();

    if (!client_id || !text || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Supabase with service role
    const supabase = createServiceClient();

    // Call the SQL RPC defined earlier
    const { data, error } = await supabase.rpc('ingest_raw_text', {
      p_client_id: client_id,
      p_source: source,
      p_text: text,
      p_metadata: metadata || {}
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to ingest data', details: error },
        { status: 500 }
      );
    }

    // Return the new knowledge_item ID
    return NextResponse.json({
      item_id: data,
      status: 'queued_for_processing'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Ingest failed', details: err.message },
      { status: 500 }
    );
  }
}
