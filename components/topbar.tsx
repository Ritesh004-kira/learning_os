"use client";

import { Search, Bell } from "lucide-react";

export function Topbar() {
    return (
        <header className="fixed top-0 left-[240px] right-0 z-20 flex h-[52px] items-center justify-between border-b border-[#1e1e24] bg-[#0d0d0f] px-5">
            {/* Left: Page title */}
            <h1 className="text-[13px] font-semibold tracking-tight text-[#f0f0f3]">
                Learning OS
            </h1>

            {/* Center: Command search */}
            <button
                className="flex items-center gap-2.5 rounded-md border border-[#1e1e24] bg-[#111114] px-3 py-1.5 text-[12px] text-[#4a4a56] transition-colors hover:border-[#2a2a32] hover:text-[#8b8b99] focus:outline-none"
                aria-label="Open command palette"
            >
                <Search size={13} strokeWidth={1.75} className="shrink-0" />
                <span>Search or jump to&hellip;</span>
                <kbd className="ml-3 hidden rounded border border-[#2a2a32] bg-[#0d0d0f] px-1.5 py-0.5 font-sans text-[10px] text-[#4a4a56] sm:inline-flex">
                    ⌘K
                </kbd>
            </button>

            {/* Right: Actions + Avatar */}
            <div className="flex items-center gap-2">
                <button
                    className="flex h-8 w-8 items-center justify-center rounded-md text-[#4a4a56] transition-colors hover:bg-[#111114] hover:text-[#8b8b99]"
                    aria-label="Notifications"
                >
                    <Bell size={15} strokeWidth={1.75} />
                </button>

                {/* Avatar */}
                <button
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-800 text-[11px] font-semibold text-violet-200 ring-1 ring-[#1e1e24] transition-opacity hover:opacity-80"
                    aria-label="User menu"
                >
                    U
                </button>
            </div>
        </header>
    );
}
