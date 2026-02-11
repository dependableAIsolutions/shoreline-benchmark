"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const shorelineConceptArt = [
  {
    id: "home",
    srcSmall: "/images/shoreline-image-home-960.webp",
    srcLarge: "/images/shoreline-image-home-1536.webp",
    alt: "Painterly shoreline concept showing two layered islands at sunrise with reflective ocean water."
  },
  {
    id: "depth",
    srcSmall: "/images/shoreline-image-960.webp",
    srcLarge: "/images/shoreline-image-1536.webp",
    alt: "Dark blue conceptual island scene labeled capability depth, calibration, and failure awareness."
  }
] as const;

export default function AboutPage() {
  const [activeArtIndex, setActiveArtIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveArtIndex((current) => (current + 1) % shorelineConceptArt.length);
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className="mx-auto max-w-[900px] px-5 py-8 text-[#E8E0D4]">
      <header className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-block font-mono text-[10px] tracking-[0.14em] text-[#3D7A6E] hover:text-[#7ab8ad]"
        >
          &larr; Back to Benchmark
        </Link>
        <div className="mb-1 font-mono text-[10px] tracking-[0.45em] text-[#3D7A6E]">METHODOLOGY</div>
        <h1 className="shoreline-title font-serif text-4xl font-bold tracking-tight text-[#E8E0D4]">
          How Shoreline Works
        </h1>
        <p className="mt-2 font-serif text-lg italic text-[#817363]">
          Understanding the metacognitive benchmark
        </p>
      </header>

      <section className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <div className="relative aspect-[3/2] w-full md:aspect-[16/9]">
          {shorelineConceptArt.map((art, index) => (
            <picture
              key={art.id}
              className={`absolute inset-0 h-full w-full transition-opacity duration-[1800ms] ${
                activeArtIndex === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <source
                type="image/webp"
                srcSet={`${art.srcSmall} 960w, ${art.srcLarge} 1536w`}
                sizes="(max-width: 900px) 100vw, 900px"
              />
              <img
                src={art.srcLarge}
                alt={art.alt}
                width={1536}
                height={1024}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </picture>
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070f1f]/30 via-transparent to-transparent" />
        </div>
      </section>

      <article className="space-y-10">
        {/* What is Shoreline */}
        <section>
          <h2 className="mb-4 font-mono text-sm tracking-[0.16em] text-[#3D7A6E]">WHAT IS SHORELINE?</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-[#c4bab0]">
            <p>
              Shoreline is a benchmark that measures not just what AI models <em>can</em> do, but what they{" "}
              <em>know</em> they can do. Every existing benchmark asks "can the model solve this?" Shoreline
              asks a deeper question: "does the model know whether it can solve this, and does it know when
              it solved it correctly?"
            </p>
            <p>
              This matters because in production systems, an AI that doesn't know its own limitations is
              dangerous. A model that confidently gives wrong answers—or that succeeds but can't recognize
              its success—creates unpredictable systems that are hard to trust and harder to deploy safely.
            </p>
          </div>
        </section>

        {/* Why Metacognition Matters */}
        <section>
          <h2 className="mb-4 font-mono text-sm tracking-[0.16em] text-[#3D7A6E]">WHY METACOGNITION MATTERS</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-[#c4bab0]">
            <p>
              Traditional benchmarks measure <strong>capability</strong>—can the model do the task? But for
              real-world deployment, you also need to know:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Self-knowledge</strong>: Does the model know what it can and can't do before trying?
              </li>
              <li>
                <strong>Self-monitoring</strong>: Can the model tell when it succeeded vs. failed?
              </li>
              <li>
                <strong>Calibration</strong>: When the model says "I'm 80% confident," is it right 80% of the time?
              </li>
            </ul>
            <p>
              A model with high capability but poor metacognition is like a brilliant employee who can't
              accurately assess their own work. You can't trust their self-reviews, you can't delegate
              effectively, and you need constant oversight.
            </p>
          </div>
        </section>

        {/* The Three-Phase Evaluation */}
        <section>
          <h2 className="mb-4 font-mono text-sm tracking-[0.16em] text-[#3D7A6E]">THE THREE-PHASE EVALUATION</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-[#c4bab0]">
            <p>
              Every task in Shoreline is evaluated through three independent phases. Importantly, these are
              separate API calls—the model cannot use its Phase 1 reasoning to influence Phase 2, or its
              Phase 2 output to trivially answer Phase 3.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-5">
              <h3 className="mb-2 font-mono text-sm font-semibold text-[#F59E0B]">Phase 1: Prediction (Sand)</h3>
              <p className="text-[14px] text-[#c4bab0]">
                Before seeing the specific problem, the model receives a description of the task category and
                difficulty level. It must predict its confidence (0-100%) that it will get the correct answer.
                This measures <strong>prospective self-knowledge</strong>—does the model understand its own
                capabilities in this domain?
              </p>
            </div>

            <div className="rounded-xl border border-[#3DA84A]/30 bg-[#3DA84A]/5 p-5">
              <h3 className="mb-2 font-mono text-sm font-semibold text-[#3DA84A]">Phase 2: Execution (Solid)</h3>
              <p className="text-[14px] text-[#c4bab0]">
                The model receives and attempts the actual task. No hints about self-evaluation—it's just
                a straightforward task attempt. The answer is verified against computed ground truth.
                This is <strong>raw capability</strong>—what the model actually achieves.
              </p>
            </div>

            <div className="rounded-xl border border-[#8A9CAA]/30 bg-[#8A9CAA]/5 p-5">
              <h3 className="mb-2 font-mono text-sm font-semibold text-[#8A9CAA]">Phase 3: Self-Evaluation</h3>
              <p className="text-[14px] text-[#c4bab0]">
                After producing its answer (but without being told if it was correct), the model evaluates
                its own work. It estimates confidence (0-100%) that its answer is correct. This measures{" "}
                <strong>retrospective self-monitoring</strong>—can the model tell whether THIS specific
                attempt succeeded?
              </p>
              <p className="mt-2 text-[13px] text-[#887a69]">
                <strong>How confidence is scored:</strong> Low confidence (&lt;40%) on wrong answers
                contributes to Concrete (failure-awareness). High confidence on wrong answers is the
                dangerous "false confidence" failure mode. Discernment still rewards both true positives
                (correct + confident) and true negatives (wrong + uncertain).
              </p>
            </div>
          </div>
        </section>

        {/* The Three Layers */}
        <section>
          <h2 className="mb-4 font-mono text-sm tracking-[0.16em] text-[#3D7A6E]">THE THREE LAYERS</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-[#c4bab0]">
            <p>
              The island visualization shows three terrain layers, each representing a different aspect
              of the model's performance and self-knowledge:
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex gap-4">
              <div className="h-6 w-10 flex-shrink-0 rounded border-2 border-dashed border-[#F59E0B] bg-[rgba(245,158,11,0.25)]" />
              <div>
                <h3 className="font-mono text-sm font-semibold text-[#F59E0B]">Sand (Claimed Depth)</h3>
                <p className="mt-1 text-[14px] text-[#c4bab0]">
                  Phase 1 claimed territory depth: confidence weighted by normalized difficulty.
                  Sand reaches 100 only if the model expressed 100% confidence at the category's
                  theoretical outer ceiling. It is not forced to contain Solid or Concrete.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-6 w-10 flex-shrink-0 rounded border-2 border-[#3C9646] bg-[rgba(55,140,65,0.35)]" />
              <div>
                <h3 className="font-mono text-sm font-semibold text-[#3DA84A]">Solid (Actual Performance)</h3>
                <p className="mt-1 text-[14px] text-[#c4bab0]">
                  The middle layer showing what the model actually achieved, verified against ground truth.
                  This is traditional benchmark performance—pure capability regardless of what the model
                  claimed or believed about itself.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-6 w-10 flex-shrink-0 rounded border-2 border-[#64788C] bg-[rgba(85,100,115,0.6)]" />
              <div>
                <h3 className="font-mono text-sm font-semibold text-[#8A9CAA]">Concrete (Failure-Aware)</h3>
                <p className="mt-1 text-[14px] text-[#c4bab0]">
                  The concrete layer represents failure-awareness: wrong answers where the model correctly
                  recognized risk and expressed low confidence in Phase 3. Higher concrete means the model
                  is less likely to miss its own failures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Metacognitive Patterns */}
        <section>
          <h2 className="mb-4 font-mono text-sm tracking-[0.16em] text-[#3D7A6E]">METACOGNITIVE PATTERNS</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-[#c4bab0]">
            <p>
              The combination of Phase 2 performance and Phase 3 self-evaluation reveals four distinct
              metacognitive patterns:
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <h3 className="font-mono text-[11px] font-semibold text-green-400">TRUE POSITIVE</h3>
              <p className="mt-1 text-[13px] text-[#c4bab0]">
                Correct answer + high confidence. The model succeeded and knew it.
              </p>
            </div>
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <h3 className="font-mono text-[11px] font-semibold text-blue-400">TRUE NEGATIVE</h3>
              <p className="mt-1 text-[13px] text-[#c4bab0]">
                Wrong answer + low confidence. The model failed but <em>knew</em> it might have failed.
                Good metacognition—it can flag its own uncertainty.
              </p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <h3 className="font-mono text-[11px] font-semibold text-red-400">FALSE CONFIDENCE</h3>
              <p className="mt-1 text-[13px] text-[#c4bab0]">
                Wrong answer + high confidence. The dangerous case: the model failed but thinks it
                succeeded. This is what breaks production systems.
              </p>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <h3 className="font-mono text-[11px] font-semibold text-yellow-400">BLIND SPOT</h3>
              <p className="mt-1 text-[13px] text-[#c4bab0]">
                Correct answer + low confidence. The model succeeded but doubted itself. Less dangerous
                but represents untapped capability.
              </p>
            </div>
          </div>
        </section>

        {/* Metrics Explained */}
        <section>
          <h2 className="mb-4 font-mono text-sm tracking-[0.16em] text-[#3D7A6E]">METRICS EXPLAINED</h2>

          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="mb-3 font-mono text-xs tracking-[0.14em] text-[#5d5144]">CORE SCORES</h3>
              <div className="space-y-4 text-[14px] text-[#c4bab0]">
                <div>
                  <strong className="text-[#8A9CAA]">Concrete</strong>: Failure-awareness score. Percentage of
                  trials where the model was wrong and correctly expressed low confidence (&lt;40%) in Phase 3.
                  Higher is better because it reduces confident failures.
                </div>
                <div>
                  <strong className="text-[#3DA84A]">Solid</strong>: Raw task performance verified against ground truth.
                  Traditional benchmark score—what the model actually achieved regardless of self-assessment.
                </div>
                <div>
                  <strong className="text-[#F59E0B]">Sand</strong>: Claimed depth from Phase 1, computed as the
                  max of (confidence × normalized difficulty) across sampled trials. The difficulty normalization
                  uses a theoretical ceiling beyond the tested range, so 100 represents confidence at an
                  out-of-scope boundary rather than the benchmark's max tested point.
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="mb-3 font-mono text-xs tracking-[0.14em] text-[#5d5144]">SELF-AWARENESS METRICS</h3>
              <div className="space-y-4 text-[14px] text-[#c4bab0]">
                <div>
                  <strong className="text-[#a78bfa]">Discernment</strong>: How well the model distinguishes its
                  successes from failures. Measures both true positives (correct + confident) AND true negatives
                  (wrong + uncertain). Higher is better. This is the primary metacognitive accuracy measure.
                </div>
                <div>
                  <strong className="text-[#F87171]">False Confidence</strong>: Percentage of trials where the model
                  was wrong but expressed high confidence (≥60%). The dangerous failure mode—the model doesn't know
                  what it doesn't know. Lower is better.
                </div>
                <div>
                  <strong className="text-[#60a5fa]">True Uncertainty</strong>: Percentage of trials where the model
                  was wrong but correctly expressed low confidence (&lt;40%). Good metacognition about failures.
                  Higher is better.
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="mb-3 font-mono text-xs tracking-[0.14em] text-[#5d5144]">CALIBRATION METRICS</h3>
              <div className="space-y-4 text-[14px] text-[#c4bab0]">
                <div>
                  <strong className="text-[#F87171]">Overconfidence</strong>: How much Phase 1 predictions exceeded
                  Phase 2 performance. The gap between what the model claimed it could do and what it delivered.
                  Lower is better.
                </div>
                <div>
                  <strong className="text-[#FBBF24]">Underconfidence</strong>: How much Phase 2 exceeded Phase 1
                  predictions. Tasks it could do but didn't think it could. Lower is better (though less
                  dangerous than overconfidence).
                </div>
                <div>
                  <strong className="text-[#F87171]">Blind Spots</strong>: Missed failures (wrong + confident).
                  This tracks cases where the model failed but still expressed high confidence in Phase 3.
                  Lower is better.
                </div>
                <div>
                  <strong className="text-[#F87171]">Total Gap</strong>: Sum of overconfidence, underconfidence,
                  and blind spots. Overall metacognitive weakness. Lower is better.
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="mb-3 font-mono text-xs tracking-[0.14em] text-[#5d5144]">DERIVED INDICES</h3>
              <div className="space-y-4 text-[14px] text-[#c4bab0]">
                <div>
                  <strong className="text-[#7cc7ff]">Capability Index</strong>: Normalized measure of how far
                  into the difficulty ladder the model can perform. Based on the transition zone where
                  performance drops. Higher is better.
                </div>
                <div>
                  <strong className="text-[#22d3ee]">Calibration Index</strong>: How well confidence predictions
                  match actual outcomes. 100 minus average calibration error. A perfectly calibrated model
                  scores 100. Higher is better.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Task Categories */}
        <section>
          <h2 className="mb-4 font-mono text-sm tracking-[0.16em] text-[#3D7A6E]">TASK CATEGORIES</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-[#c4bab0]">
            <p>
              Shoreline evaluates models across 11 categories, chosen for their clear ground truth
              and scalable difficulty:
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { name: "Multiplication", desc: "Multi-digit integer multiplication" },
              { name: "Modular Exp.", desc: "Modular exponentiation calculations" },
              { name: "Boolean Circuits", desc: "Evaluating logic gate networks" },
              { name: "Matrix Det.", desc: "Computing matrix determinants" },
              { name: "Combinatorics", desc: "Counting problems with constraints" },
              { name: "Random Gen.", desc: "Statistical quality of random sequences" },
              { name: "Constrained Write", desc: "Writing with specific constraints" },
              { name: "Sudoku Gen.", desc: "Generating valid Sudoku puzzles" },
              { name: "Distribution", desc: "Matching statistical distributions" },
              { name: "Self-Referential", desc: "Text that correctly describes itself" },
              { name: "Counting", desc: "Counting occurrences in context" },
            ].map(({ name, desc }) => (
              <div key={name} className="rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3">
                <div className="font-mono text-[11px] font-semibold text-[#8c7d6b]">{name}</div>
                <div className="mt-1 text-[13px] text-[#887a69]">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Adaptive Difficulty */}
        <section>
          <h2 className="mb-4 font-mono text-sm tracking-[0.16em] text-[#3D7A6E]">ADAPTIVE DIFFICULTY</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-[#c4bab0]">
            <p>
              Unlike fixed benchmarks, Shoreline uses adaptive difficulty to find each model's
              <strong> transition zone</strong>—the difficulty level where performance degrades from
              high to low accuracy. This is where metacognition becomes most interesting and revealing.
            </p>
            <p>
              The benchmark uses binary search to locate this zone, then densely samples around it.
              This means every model is tested at the difficulty levels that matter most for that
              specific model, rather than on fixed problems that might be trivially easy or
              impossibly hard.
            </p>
          </div>
        </section>

        {/* No LLM Judges */}
        <section>
          <h2 className="mb-4 font-mono text-sm tracking-[0.16em] text-[#3D7A6E]">NO LLM JUDGES</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-[#c4bab0]">
            <p>
              Every Phase 2 score is mechanically verified against computed ground truth. No model
              evaluates another model. This eliminates the biggest source of noise and bias in
              modern benchmarks.
            </p>
            <p>
              Tasks are specifically chosen to have unambiguous, automatically verifiable answers:
              integer arithmetic has exactly one right answer, Sudoku puzzles are either valid or not,
              constraint violations can be mechanically detected.
            </p>
          </div>
        </section>
      </article>

      <footer className="mt-12 border-t border-white/10 pt-6 text-center">
        <Link
          href="/"
          className="inline-block rounded-md border border-[#3D7A6E] px-4 py-2 font-mono text-[11px] font-semibold text-[#7ab8ad] hover:bg-[#3D7A6E]/20"
        >
          View Benchmark Results
        </Link>
        <p className="mt-4 font-mono text-[9px] tracking-[0.08em] text-[#5d5144]">
          SHORELINE v1 FOUNDATION • Dependable AI Solutions
        </p>
      </footer>
    </main>
  );
}
