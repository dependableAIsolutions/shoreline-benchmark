"use client";

import { useState } from "react";
import { categoryLabels } from "../data/results";
import { samplesByModel, type SampleResult } from "../data/samples.generated";
import type { CategoryKey } from "../lib/types";

interface ResultsViewerProps {
  modelId?: string;
}

const patternColors: Record<string, { bg: string; text: string; border: string }> = {
  true_positive: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30" },
  true_negative: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  false_confidence: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
  blind_spot: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" }
};

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function PhaseBlock({
  phase,
  label,
  color,
  data
}: {
  phase: 1 | 2 | 3;
  label: string;
  color: string;
  data: SampleResult["phase1"] | SampleResult["phase2"] | SampleResult["phase3"];
}) {
  const [expanded, setExpanded] = useState(phase === 2);

  const isPhase2 = "isCorrect" in data;
  const confidence = "confidence" in data ? data.confidence : null;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ backgroundColor: `${color}30`, color }}
          >
            {phase}
          </span>
          <span className="font-mono text-[11px] font-semibold" style={{ color }}>
            {label}
          </span>
          {confidence !== null && (
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-[#a09080]">
              {confidence}% confidence
            </span>
          )}
          {isPhase2 && (
            <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
              data.isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}>
              {data.isCorrect ? "Correct" : "Incorrect"}
            </span>
          )}
          {isPhase2 && data.partialScore !== undefined && data.partialScore < 1 && data.partialScore > 0 && (
            <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 font-mono text-[10px] text-yellow-400">
              {Math.round(data.partialScore * 100)}% partial
            </span>
          )}
        </div>
        <span className="text-[#5d5144]">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-3 py-3 text-xs">
          <div className="mb-3">
            <div className="mb-1 font-mono text-[9px] tracking-[0.1em] text-[#5d5144]">PROMPT</div>
            <pre className="whitespace-pre-wrap rounded bg-black/30 p-2 font-mono text-[11px] leading-relaxed text-[#a09080]">
              {truncateText(data.prompt, 500)}
            </pre>
          </div>
          <div>
            <div className="mb-1 font-mono text-[9px] tracking-[0.1em] text-[#5d5144]">RESPONSE</div>
            <pre className="whitespace-pre-wrap rounded bg-black/30 p-2 font-mono text-[11px] leading-relaxed text-[#d8cfc2]">
              {truncateText(data.response, 400)}
            </pre>
          </div>
          {isPhase2 && (
            <div className="mt-2 space-y-1 font-mono text-[10px]">
              <div className="text-[#5d5144]">
                Extracted: <span className="text-[#8c8070]">{truncateText(data.extractedAnswer, 50)}</span>
              </div>
              <div className="text-[#5d5144]">
                Expected: <span className="text-[#8c8070]">{truncateText(data.correctAnswer, 50)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: SampleResult }) {
  const [expanded, setExpanded] = useState(false);
  const colors = patternColors[result.pattern];

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02]"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-[#d8cfc2]">
            {categoryLabels[result.category as CategoryKey] || result.category}
          </span>
          <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#5d5144]">
            difficulty {result.difficulty}
          </span>
          <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${colors.text}`}>
            {result.patternLabel}
          </span>
        </div>
        <span className="text-lg text-[#5d5144]">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-white/5 bg-black/20 px-4 py-3">
          <PhaseBlock phase={1} label="Prediction" color="#F59E0B" data={result.phase1} />
          <PhaseBlock phase={2} label="Execution" color="#3DA84A" data={result.phase2} />
          <PhaseBlock phase={3} label="Self-Evaluation" color="#8A9CAA" data={result.phase3} />
        </div>
      )}
    </div>
  );
}

export function ResultsViewer({ modelId }: ResultsViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  // Get samples for the selected model, or use first available model
  const availableModels = Object.keys(samplesByModel);
  const selectedModelId = modelId && samplesByModel[modelId] ? modelId : availableModels[0];
  const samples = selectedModelId ? samplesByModel[selectedModelId] || [] : [];

  const filteredResults = filter === "all"
    ? samples
    : samples.filter(r => r.pattern === filter);

  // Count patterns for the filter buttons
  const patternCounts = samples.reduce((acc, s) => {
    acc[s.pattern] = (acc[s.pattern] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (samples.length === 0) {
    return null; // No samples available
  }

  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left hover:bg-white/[0.03]"
      >
        <div>
          <h2 className="font-mono text-sm tracking-[0.1em] text-[#8c7d6b]">
            SAMPLE RESULTS
          </h2>
          <p className="mt-0.5 text-xs text-[#5d5144]">
            {samples.length} example{samples.length !== 1 ? "s" : ""} from {selectedModelId?.split("/").pop() || "this model"}
          </p>
        </div>
        <span className="text-xl text-[#5d5144]">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3 px-1">
            <p className="max-w-2xl text-xs text-[#6d6050]">
              Each task goes through three phases: <span className="text-[#F59E0B]">Prediction</span> (confidence before attempting), <span className="text-[#3DA84A]">Execution</span> (actual performance), and <span className="text-[#8A9CAA]">Self-Evaluation</span> (confidence after completing). The combination reveals metacognitive patterns.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "all", label: "All" },
                { key: "true_positive", label: "True Positive" },
                { key: "true_negative", label: "True Negative" },
                { key: "false_confidence", label: "False Confidence" },
                { key: "blind_spot", label: "Blind Spot" }
              ].map(({ key, label }) => {
                const count = key === "all" ? samples.length : (patternCounts[key] || 0);
                if (key !== "all" && count === 0) return null;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`rounded px-2 py-1 font-mono text-[10px] ${
                      filter === key
                        ? "bg-[#3D7A6E]/30 text-[#7ab8ad]"
                        : "bg-white/5 text-[#5d5144] hover:bg-white/10"
                    }`}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2 rounded-lg border border-white/5 bg-white/[0.01] p-3">
            <div className="grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500/50" />
                <span className="text-[#8c8070]">True Positive: Correct + Confident</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500/50" />
                <span className="text-[#8c8070]">True Negative: Wrong + Doubted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500/50" />
                <span className="text-[#8c8070]">False Confidence: Wrong + Confident</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
                <span className="text-[#8c8070]">Blind Spot: Correct + Doubted</span>
              </div>
            </div>
          </div>

          {filteredResults.length > 0 ? (
            filteredResults.map((result, index) => (
              <ResultCard key={`${result.category}-${index}`} result={result} />
            ))
          ) : (
            <div className="rounded-lg border border-white/5 bg-white/[0.01] p-4 text-center text-sm text-[#5d5144]">
              No samples matching this filter
            </div>
          )}
        </div>
      )}
    </section>
  );
}
