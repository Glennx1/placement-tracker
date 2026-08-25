import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PESU Placement Intelligence & Drive Tracker",
  description:
    "AI-powered placement intelligence platform for @pes.edu emails with Gemini structured extraction, CGPA eligibility matching, and hierarchical lifecycle trees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col text-slate-100 selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
