"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Tracks",
        href: "/tracks",
        icon: BookOpen,
    },
    {
        label: "Notes",
        href: "/notes",
        icon: FileText,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed top-0 left-0 z-30 flex h-screen w-[240px] flex-col border-r border-white/[0.06] bg-[#0d0d0f]">
            {/* Logo area — aligns with topbar height */}
            <div className="flex h-[52px] items-center border-b border-white/[0.06] px-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600">
                        <span className="text-[10px] font-bold tracking-wide text-white">L</span>
                    </div>
                    <span className="text-[13px] font-semibold tracking-tight text-[#f0f0f3]">
                        Learning OS
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 pt-3">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150",
                                isActive
                                    ? "border-l-2 border-violet-500 bg-white/[0.04] pl-[10px] text-[#e2d9fb]"
                                    : "border-l-2 border-transparent text-[#8b8b99] hover:bg-white/[0.03] hover:text-[#d4d4e0]"
                            )}
                        >
                            <Icon
                                size={15}
                                strokeWidth={isActive ? 2 : 1.75}
                                className={cn(
                                    "shrink-0 transition-colors duration-150",
                                    isActive ? "text-violet-400" : "text-[#3a3a46] group-hover:text-[#8b8b99]"
                                )}
                            />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom user stub */}
            <div className="border-t border-white/[0.06] p-3">
                <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-800 text-[10px] font-semibold text-violet-200">
                        U
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[12px] font-medium text-[#f0f0f3]">User</span>
                        <span className="truncate text-[11px] text-[#4a4a56]">user@learningos.io</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
