import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type Props = {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  onDark?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  onDark = false,
  className,
}: Props) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && <span className={onDark ? "eyebrow-on-dark" : "eyebrow"}>{eyebrow}</span>}
      <h2
        className={cn(
          "max-w-3xl text-balance text-3xl leading-[1.08] sm:text-4xl md:text-5xl",
          onDark ? "text-ivory" : "text-ink"
        )}
      >
        {title}
      </h2>
      <span className={cn("hairline", align === "center" ? "" : "ml-0")} />
      {intro && (
        <p
          className={cn(
            "max-w-2xl text-pretty text-[0.98rem] font-light leading-relaxed",
            onDark ? "text-taupe" : "text-graphite"
          )}
        >
          {intro}
        </p>
      )}
    </Reveal>
  );
}
