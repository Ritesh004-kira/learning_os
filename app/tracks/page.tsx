"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Track = {
  id: string;
  title: string;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function fetchTracks() {
    const { data, error } = await supabase
      .from("tracks")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchTracks error:", error);
    } else {
      setTracks(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchTracks();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;

    setCreating(true);
    const { error } = await supabase.from("tracks").insert({ title });

    if (error) {
      console.error("insert error:", error);
    } else {
      setInput("");
      await fetchTracks();
    }
    setCreating(false);
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-[#f0f0f3]">
          Tracks
        </h2>
        <p className="mt-1 text-[13px] text-[#4a4a56]">
          Learning tracks you&apos;re building.
        </p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New track title…"
          disabled={creating}
          className="flex-1 rounded-lg border border-white/[0.08] bg-[#111114] px-3.5 py-2.5 text-[13px] text-[#f0f0f3] placeholder-[#4a4a56] outline-none ring-0 transition-colors focus:border-violet-500/60 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={creating || !input.trim()}
          className="rounded-lg bg-violet-600 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {creating ? "Adding…" : "Add Track"}
        </button>
      </form>

      {/* Track list */}
      {loading ? (
        <div className="flex items-center gap-2 text-[13px] text-[#4a4a56]">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-[#4a4a56] border-t-violet-500" />
          Loading…
        </div>
      ) : tracks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/[0.08] px-4 py-10 text-center">
          <p className="text-[13px] text-[#4a4a56]">
            No tracks yet. Start by creating one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#111114] px-4 py-3.5 transition-colors hover:border-white/[0.1]"
            >
              <span className="text-[13px] font-medium text-[#f0f0f3]">
                {track.title}
              </span>
              <span className="ml-4 shrink-0 text-[11px] text-[#4a4a56]">
                {formatDate(track.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
