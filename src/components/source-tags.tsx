import type { SourceTag } from "@/lib/types";

export function SourceTags({ sources }: { sources: SourceTag[] }) {
  if (sources.length === 0) {
    return <span className="text-muted-foreground/50">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {sources.map((s, i) => (
        <span
          key={`${s.label}-${i}`}
          className="inline-flex flex-col rounded-md bg-secondary px-2 py-1 leading-tight"
        >
          <span className="text-xs font-medium text-foreground">
            {s.label}
          </span>
          {s.sub && (
            <span className="text-[11px] text-muted-foreground">{s.sub}</span>
          )}
        </span>
      ))}
    </div>
  );
}
