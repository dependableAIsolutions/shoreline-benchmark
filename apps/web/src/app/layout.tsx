import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shoreline Benchmark",
  description: "Metacognitive capability benchmark: sand, solid, concrete"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
