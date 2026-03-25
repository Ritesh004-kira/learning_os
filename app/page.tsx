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

export default function DashboardPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function fetchTracks() {
    const { data, error } = await supabase
      .from("tracks")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) console.error("fetchTracks error:", error);
    else setTracks(data ?? []);
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
    if (error) console.error("insert error:", error);
    else {
      setInput("");
      await fetchTracks();
    }
    setCreating(false);
    inputRef.current?.focus();
  }

  const stats = [
    { label: "Active Tracks", value: loading ? "—" : String(tracks.length) },
    { label: "Notes", value: "0" },
    { label: "Hours This Week", value: "—" },
    { label: "Streak", value: "—" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-[#f0f0f3]">
          Dashboard
        </h2>
        <p className="mt-1 text-[13px] text-[#4a4a56]">
          Here&apos;s what you&apos;re working on.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-white/[0.06] bg-[#111114] px-4 py-4"
          >
            <p className="text-[11px] font-medium uppercase tracking-widest text-[#4a4a56]">
              {label}
            </p>
            <p className="mt-1.5 text-[22px] font-semibold text-[#f0f0f3]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Tracks */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[#f0f0f3]">
            Recent Tracks
          </h3>
          <a
            href="/tracks"
            className="text-[12px] text-[#7c3aed] hover:text-violet-400"
          >
            View all →
          </a>
        </div>

        {/* Inline create */}
        <form onSubmit={handleCreate} className="mb-3 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="New track title…"
            disabled={creating}
            className="flex-1 rounded-lg border border-white/[0.08] bg-[#111114] px-3.5 py-2.5 text-[13px] text-[#f0f0f3] placeholder-[#4a4a56] outline-none transition-colors focus:border-violet-500/60 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={creating || !input.trim()}
            className="rounded-lg bg-violet-600 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {creating ? "Adding…" : "Add"}
          </button>
        </form>

        {/* Track list */}
        {loading ? (
          <div className="flex items-center gap-2 text-[13px] text-[#4a4a56]">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-[#4a4a56] border-t-violet-500" />
            Loading…
          </div>
        ) : tracks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/[0.08] px-4 py-8 text-center">
            <p className="text-[13px] text-[#4a4a56]">
              No tracks yet. Start by creating one above.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#111114] px-4 py-3.5 transition-colors hover:border-white/[0.1]"
              >
                <span className="truncate text-[13px] font-medium text-[#f0f0f3]">
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
    </div>
  );
}
