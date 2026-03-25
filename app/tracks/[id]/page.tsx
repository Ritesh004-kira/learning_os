"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Track = {
  id: string;
  title: string;
};

type Module = {
  id: string;
  track_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
};

export default function TrackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [track, setTrack] = useState<Track | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const [{ data: trackData, error: trackError }, { data: modulesData, error: modulesError }] =
        await Promise.all([
          supabase.from("tracks").select("id, title").eq("id", id).single(),
          supabase
            .from("modules")
            .select("id, track_id, title, is_completed, created_at")
            .eq("track_id", id)
            .order("created_at", { ascending: true }),
        ]);

      if (trackError) console.error("track fetch error:", trackError);
      else setTrack(trackData);

      if (modulesError) console.error("modules fetch error:", modulesError);
      else setModules(modulesData ?? []);

      setLoading(false);
    }
    load();
  }, [id]);

  async function handleCreate(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const title = input.trim();
    if (!title || creating) return;

    setCreating(true);
    const { data, error } = await supabase
      .from("modules")
      .insert({ track_id: id, title, is_completed: false })
      .select()
      .single();

    if (error) {
      console.error("module insert error:", error);
    } else {
      setModules((prev) => [...prev, data]);
      setInput("");
    }
    setCreating(false);
    inputRef.current?.focus();
  }

  async function handleToggle(module: Module) {
    if (toggling) return;
    setToggling(module.id);

    const next = !module.is_completed;
    setModules((prev) =>
      prev.map((m) => (m.id === module.id ? { ...m, is_completed: next } : m))
    );

    const { error } = await supabase
      .from("modules")
      .update({ is_completed: next })
      .eq("id", module.id);

    if (error) {
      console.error("toggle error:", error);
      setModules((prev) =>
        prev.map((m) => (m.id === module.id ? { ...m, is_completed: module.is_completed } : m))
      );
    }
    setToggling(null);
  }

  const completedCount = modules.filter((m) => m.is_completed).length;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-8">
        <div className="flex items-center gap-2 text-[13px] text-[#4a4a56]">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-[#4a4a56] border-t-violet-500" />
          Loading…
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-8">
        <p className="text-[13px] text-[#4a4a56]">Track not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      {/* Back */}
      <button
        onClick={() => router.push("/tracks")}
        className="mb-6 flex items-center gap-1.5 text-[12px] text-[#4a4a56] transition-colors hover:text-[#f0f0f3]"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Tracks
      </button>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-[#f0f0f3]">
          {track.title}
        </h2>
        {modules.length > 0 && (
          <>
            <p className="mt-1 text-[12px] text-[#4a4a56]">
              {completedCount} / {modules.length} &middot;{" "}
              {Math.round((completedCount / modules.length) * 100)}% complete
            </p>
            {/* Progress bar */}
            <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.round((completedCount / modules.length) * 100)}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Module list */}
      <div className="flex flex-col gap-1">
        {modules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/[0.08] px-4 py-10 text-center">
            <p className="text-[13px] text-[#4a4a56]">
              No modules yet. Break your track into steps.
            </p>
          </div>
        ) : (
          modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => handleToggle(mod)}
              disabled={toggling === mod.id}
              className={`group flex w-full items-center gap-3 rounded-lg border bg-[#111114] px-4 py-3 text-left transition-all duration-200 hover:border-white/[0.12] active:scale-[0.995] ${
                mod.is_completed
                  ? "border-white/[0.04] opacity-50 hover:opacity-70"
                  : "border-white/[0.06]"
              }`}
            >
              {/* Checkbox */}
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-150 active:scale-90 ${
                  mod.is_completed
                    ? "border-violet-500 bg-violet-500/20 scale-100"
                    : "border-white/[0.15] group-hover:border-white/30"
                }`}
              >
                {mod.is_completed && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path
                      d="M1 3.5L3.5 6L8 1"
                      stroke="#a78bfa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              {/* Title */}
              <span
                className={`text-[13px] font-medium transition-all duration-200 ${
                  mod.is_completed
                    ? "text-[#4a4a56] line-through decoration-[#4a4a56]/60"
                    : "text-[#f0f0f3]"
                }`}
              >
                {mod.title}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Create input */}
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#111114] px-4 py-3 transition-colors focus-within:border-violet-500/40">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/[0.15]" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCreate}
          placeholder="New module… (press Enter)"
          disabled={creating}
          className="flex-1 bg-transparent text-[13px] text-[#f0f0f3] placeholder-[#4a4a56] outline-none disabled:opacity-50"
        />
      </div>
    </div>
  );
}
