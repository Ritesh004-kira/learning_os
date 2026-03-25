import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Learning OS",
    description: "Your personal operating system for learning.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} font-sans antialiased`}>
                <div className="relative flex min-h-screen bg-[#0d0d0f]">
                    {/* Fixed sidebar */}
                    <Sidebar />

                    {/* Main column — offset by sidebar width */}
                    <div className="flex flex-1 flex-col pl-[240px]">
                        {/* Fixed topbar */}
                        <Topbar />

                        {/* Scrollable content area */}
                        <main className="flex-1 overflow-y-auto pt-[52px]">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
