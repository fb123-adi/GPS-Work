/**
 * Placeholder wordmark: expanded Mona Sans with a measured hairline.
 * TODO(owner): replace with the final logotype (SVG) when ready.
 */
export function Wordmark({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={`inline-flex flex-col items-start leading-none ${className}`} aria-label="Kyveron">
      <span
        aria-hidden="true"
        className="text-[1.05rem] sm:text-[1.15rem]"
        style={{ fontVariationSettings: '"wdth" 125', fontWeight: 650, letterSpacing: "0.34em", marginRight: "-0.34em" }}
      >
        KYVERON
      </span>
      <span aria-hidden="true" className="mt-[5px] flex w-full items-center gap-[3px]">
        <span className={`h-px flex-1 ${tone === "dark" ? "bg-obsidian/60" : "bg-ivory/60"}`} />
        <span className="h-[5px] w-px bg-cobalt" />
        <span className={`h-px w-[18%] ${tone === "dark" ? "bg-obsidian/60" : "bg-ivory/60"}`} />
      </span>
    </span>
  );
}
