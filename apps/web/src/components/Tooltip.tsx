"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  maxWidth?: number;
  className?: string;
}

export function Tooltip({ content, children, position = "top", maxWidth = 280, className = "" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  // Track client-side mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePosition = useCallback((tooltipEl: HTMLDivElement | null) => {
    if (!tooltipEl || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    let x = 0;
    let y = 0;

    switch (position) {
      case "top":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case "bottom":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case "left":
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case "right":
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding));

    setCoords({ x, y });
  }, [position]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className={`cursor-help ${className || "inline-block"}`}
      >
        {children}
      </div>
      {/* Only render portal after client-side mount to avoid hydration mismatch */}
      {isMounted && isVisible && createPortal(
        <div
          ref={updatePosition}
          className="fixed z-50 rounded-lg border border-white/10 bg-[#0a1225]/95 px-3 py-2 text-xs text-[#d8cfc2] shadow-xl backdrop-blur-sm"
          style={{
            left: coords.x,
            top: coords.y,
            maxWidth,
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}

// Pre-defined tooltip content for metrics
export const metricTooltips = {
  concrete: (
    <div>
      <div className="mb-1 font-semibold text-[#8A9CAA]">Concrete (Failure-Aware Depth)</div>
      <p>
        Depth where the model admits failure after answering: wrong result + low Phase 3 confidence,
        weighted by normalized difficulty. Concrete is clamped to never exceed solid depth.
      </p>
    </div>
  ),
  solid: (
    <div>
      <div className="mb-1 font-semibold text-[#3DA84A]">Solid (Verified Depth)</div>
      <p>
        Verified task depth from Phase 2: performance weighted by normalized difficulty. This places
        solid on the same 0-100 depth axis as sand and concrete.
      </p>
    </div>
  ),
  sand: (
    <div>
      <div className="mb-1 font-semibold text-[#F59E0B]">Sand (Claimed Depth)</div>
      <p>
        Phase 1 claim intensity: confidence weighted by normalized difficulty. Sand reaches 100 only
        when the model expresses 100% confidence at the category's theoretical outer ceiling.
      </p>
    </div>
  ),
  leaderboardScore: (
    <div>
      <div className="mb-1 font-semibold text-[#7ab8ad]">Leaderboard Score</div>
      <p>
        Composite ranking score that emphasizes verified capability while still rewarding
        failure-awareness.
      </p>
      <p className="mt-1 text-[10px] text-[#887a69]">Formula: 75% solid + 25% concrete</p>
    </div>
  ),
  overconfidence: (
    <div>
      <div className="mb-1 font-semibold text-[#F87171]">Overconfidence</div>
      <p>
        Claimed depth beyond verified depth. High overconfidence means the model claims capability
        deeper than it can reliably execute.
      </p>
      <p className="mt-1 text-[10px] text-[#887a69]">Formula: avg(sand - solid) where sand &gt; solid</p>
    </div>
  ),
  underconfidence: (
    <div>
      <div className="mb-1 font-semibold text-[#FBBF24]">Underconfidence</div>
      <p>
        Verified depth beyond claimed depth. High underconfidence means the model performs deeper
        than it initially claims.
      </p>
      <p className="mt-1 text-[10px] text-[#887a69]">Formula: avg(solid - sand) where solid &gt; sand</p>
    </div>
  ),
  blindSpots: (
    <div>
      <div className="mb-1 font-semibold text-[#F87171]">Blind Spots (Missed Failures)</div>
      <p>
        Wrong answers where the model stayed confident. This is the dangerous case where the model
        fails but does not detect its own failure.
      </p>
      <p className="mt-1 text-[10px] text-[#887a69]">Formula: false confidence (wrong + high confidence)</p>
    </div>
  ),
  totalGap: (
    <div>
      <div className="mb-1 font-semibold text-[#F87171]">Total Gap</div>
      <p>
        Overall metacognitive weakness combining all sources of miscalibration. Lower is better.
        A model with zero total gap has perfect self-knowledge.
      </p>
      <p className="mt-1 text-[10px] text-[#887a69]">Formula: overconfidence + underconfidence + blind spots</p>
    </div>
  ),
  capability: (
    <div>
      <div className="mb-1 font-semibold text-[#7cc7ff]">Capability Index</div>
      <p>
        Normalized measure of how far into the difficulty ladder the model can reliably perform.
        Based on the transition zone where performance degrades from high to low accuracy.
      </p>
    </div>
  ),
  discernment: (
    <div>
      <div className="mb-1 font-semibold text-[#a78bfa]">Discernment</div>
      <p>
        How well the model can distinguish between its successes and failures. High discernment
        means the model reliably knows when it got something right vs. wrong.
      </p>
    </div>
  ),
  calibration: (
    <div>
      <div className="mb-1 font-semibold text-[#22d3ee]">Calibration Index</div>
      <p>
        How well the model's confidence predictions match actual outcomes. A perfectly calibrated
        model saying "70% confident" would be correct exactly 70% of the time.
      </p>
      <p className="mt-1 text-[10px] text-[#887a69]">Formula: 100 - avg calibration error</p>
    </div>
  ),
  invalidConfidence: (
    <div>
      <div className="mb-1 font-semibold text-[#F87171]">Invalid Confidence Rate</div>
      <p>
        Percentage of trials where confidence extraction failed. This happens when the model
        times out, returns empty responses, or doesn't include a parseable confidence value
        in Phase 1 (prediction) or Phase 3 (self-evaluation).
      </p>
      <p className="mt-1.5">
        A high invalid rate typically indicates API issues (timeouts, rate limits) or that
        the model doesn't follow the confidence format instructions. These trials are excluded
        from calibration calculations.
      </p>
    </div>
  ),
};
