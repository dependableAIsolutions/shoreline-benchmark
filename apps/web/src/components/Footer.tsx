import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-10 w-full border-t border-white/10 bg-[#070d1f]/80 py-6">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-5 text-sm text-[#887a69] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-serif text-base text-[#d8cfc2]">Shoreline</span>
          <span className="font-mono text-[9px] tracking-[0.08em] text-[#5d5144]">
            SHORELINE v1 FOUNDATION
          </span>
          <span className="text-xs text-[#766958]">© {new Date().getFullYear()} Dependable AI Solutions</span>
        </div>

        <nav className="flex flex-wrap gap-4 font-mono text-[10px] tracking-[0.14em]">
          <Link href="/about" className="text-[#7c6f5e] transition-colors duration-200 hover:text-[#7ab8ad]">
            About & Methodology
          </Link>
          <a
            href="https://dependableaisolutions.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7c6f5e] transition-colors duration-200 hover:text-[#7ab8ad]"
          >
            DAIS Home
          </a>
          <a
            href="https://services.findbusiness.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7c6f5e] transition-colors duration-200 hover:text-[#7ab8ad]"
          >
            FindBusiness Services
          </a>
        </nav>
      </div>
    </footer>
  );
}
