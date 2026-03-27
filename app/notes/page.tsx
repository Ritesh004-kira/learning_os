"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Note = {
  id: string;
  module_id: string | null;
  title: string;
  content: string;
  created_at: string;
  summary?: string | null;
  insights?: any;
  module?: {
    title: string;
    track?: {
      title: string;
    } | null;
  } | null;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchNotes() {
      const { data, error } = await supabase
        .from("notes")
        .select(`
          *,
          summary,
          insights,
          module:modules(
            title,
            track:tracks(title)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
      } else {
        // Supabase joins arrays for nested sometimes, or objects depending on cardinality. 
        // modules is 1:1 here technically (belongsTo), but lets cast properly
        setNotes((data as any[]) || []);
      }
      setLoading(false);
    }
    fetchNotes();
  }, []);

  async function handleSave() {
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("notes")
      .insert({ title: title.trim(), content: content.trim() })
      .select()
      .single();

    if (error) {
      console.error("Error creating note:", error);
    } else if (data) {
      setNotes((prev) => [data as Note, ...prev]);
      setTitle("");
      setContent("");
    }
    setSaving(false);
  }

  async function handleAnalyze(noteId: string) {
    setAnalysisLoading(noteId);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/analyze-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n)));
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
    } finally {
      setAnalysisLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-8">
        <div className="flex items-center gap-2 text-[13px] text-[#4a4a56]">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-[#4a4a56] border-t-violet-500" />
          Loading…
        </div>
        {errorMsg && <p className="mt-2 text-red-400 text-sm">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-[#f0f0f3]">
          Notes
        </h2>
        <p className="mt-1 text-[13px] text-[#4a4a56]">
          Your global knowledge base.
        </p>
      </div>

      <div className="mb-10 flex flex-col gap-3 rounded-lg border border-white/[0.06] bg-[#111114] p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title…"
          className="bg-transparent text-[14px] font-medium text-[#f0f0f3] placeholder-[#4a4a56] outline-none"
          disabled={saving}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your note here…"
          rows={4}
          className="w-full resize-none bg-transparent text-[13px] text-[#8b8b99] placeholder-[#4a4a56] outline-none"
          disabled={saving}
        />
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="flex h-8 items-center justify-center rounded-md bg-violet-600 px-4 text-[12px] font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600"
          >
            {saving ? "Saving…" : "Save Note"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/[0.08] px-4 py-10 text-center">
            <p className="text-[13px] text-[#4a4a56]">
              Start capturing your learning. Notes power your system.
            </p>
          </div>
        ) : (
          notes.map((note) => {
            const isExpanded = expandedId === note.id;
            const trackData = note.module?.track as any;
            const trackTitle = trackData?.title || trackData?.[0]?.title;
            const moduleTitle = note.module?.title;

            return (
              <div
                key={note.id}
                onClick={() => setExpandedId(isExpanded ? null : note.id)}
                className="group flex cursor-pointer flex-col gap-2 rounded-lg border border-white/[0.06] bg-[#111114] px-5 py-4 transition-colors hover:border-white/[0.12]"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[14px] font-medium text-[#f0f0f3]">
                    {note.title}
                  </h3>
                  <div className="mt-0.5 flex shrink-0 items-center text-[11px] text-[#4a4a56]">
                    {new Date(note.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {moduleTitle && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-violet-400/80">
                    <span>📘</span>
                    <span>
                      {trackTitle ? `${trackTitle} / ` : ""}
                      {moduleTitle}
                    </span>
                  </div>
                )}

                {/* Analysis Section */}
                {note.summary && (
                  <div className="mt-2 rounded bg-[#0e0e1a] border border-violet-500/10 px-3 py-2">
                    <p className="text-[11.5px] leading-snug text-[#a0a0b8]">
                      <span className="mr-1 font-medium text-violet-400">Summary</span>
                      {note.summary}
                    </p>
                  </div>
                )}
                {note.insights && Array.isArray(note.insights) && note.insights.length > 0 && (() => {
                  const isInsightsExpanded = expandedInsights.has(note.id);
                  const visible = isInsightsExpanded ? note.insights : note.insights.slice(0, 2);
                  return (
                    <div className="mt-1.5">
                      <ul className="list-disc list-inside space-y-0.5">
                        {visible.map((ins: string, idx: number) => (
                          <li key={idx} className="text-[11.5px] leading-snug text-[#8b8b99]">{ins}</li>
                        ))}
                      </ul>
                      {note.insights.length > 2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedInsights((prev) => {
                              const next = new Set(prev);
                              isInsightsExpanded ? next.delete(note.id) : next.add(note.id);
                              return next;
                            });
                          }}
                          className="mt-1 text-[11px] text-violet-400/70 hover:text-violet-400 transition-colors"
                        >
                          {isInsightsExpanded ? 'Show less' : `+${note.insights.length - 2} more`}
                        </button>
                      )}
                    </div>
                  );
                })()}

                <div className="flex justify-end mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!note.summary) handleAnalyze(note.id); }}
                    disabled={!!note.summary || analysisLoading === note.id}
                    className={`flex items-center gap-1.5 rounded px-3 py-1 text-[11px] font-medium transition-colors ${
                      note.summary
                        ? 'cursor-default text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        : analysisLoading === note.id
                          ? 'bg-violet-600/50 text-white cursor-wait'
                          : 'bg-violet-600 text-white hover:bg-violet-500'
                    }`}
                  >
                    {note.summary ? (
                      <>
                        <span>✓</span>
                        <span>Analyzed</span>
                      </>
                    ) : analysisLoading === note.id ? (
                      <>
                        <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border border-white/30 border-t-white" />
                        <span>Analyzing…</span>
                      </>
                    ) : (
                      <span>Analyze</span>
                    )}
                  </button>
                </div>

                <div className="relative mt-1">
                  <p
                    className={`whitespace-pre-wrap text-[13px] leading-relaxed text-[#8b8b99] ${
                      isExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {note.content}
                  </p>
                  {!isExpanded && (
                    <div className="absolute bottom-0 left-0 h-8 w-full bg-gradient-to-t from-[#111114] to-transparent" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
