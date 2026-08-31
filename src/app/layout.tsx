import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PES Campus Intelligence & Opportunities Tracker",
  description:
    "AI-powered campus communication intelligence platform for @pes.edu emails with Gemini structured extraction, category bucketing (Companies, Hackathons, Workshops, Notices), and task checklists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

