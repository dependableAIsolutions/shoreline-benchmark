import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shoreline-714c6.web.app";

export const metadata: Metadata = {
  title: "How Shoreline Works",
  description:
    "Learn Shoreline's three-phase methodology for evaluating AI model capability, calibration, and metacognitive failure-awareness.",
  alternates: {
    canonical: "/about"
  },
  openGraph: {
    url: `${SITE_URL}/about`,
    title: "How Shoreline Works",
    description:
      "Understand how Shoreline measures claimed depth, verified depth, and failure-awareness across reasoning tasks."
  },
  twitter: {
    title: "How Shoreline Works",
    description:
      "Understand how Shoreline measures claimed depth, verified depth, and failure-awareness across reasoning tasks."
  }
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
