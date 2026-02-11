import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "Shoreline Benchmark",
  description: "Metacognitive capability benchmark: sand, solid, concrete"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <Footer />
      </body>
    </html>
  );
}
