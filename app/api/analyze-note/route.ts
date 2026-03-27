import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeNote } from '@/lib/openaiClient';

export async function POST(req: Request) {
  try {
    const { noteId } = await req.json();
    if (!noteId) {
      return NextResponse.json({ error: 'noteId is required' }, { status: 400 });
    }

    // Fetch note content
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('content')
      .eq('id', noteId)
      .single();

    if (fetchError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Call OpenAI to analyze
    const analysis = await analyzeNote(note.content);

    // Update note with summary and insights
    const { data: updated, error: updateError } = await supabase
      .from('notes')
      .update({ summary: analysis.summary, insights: analysis.insights })
      .eq('id', noteId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
