import { ELEMENT_CONFIG } from "@/lib/element-config";
import { ELEMENT_LABEL, ELEMENT_ORDER, type ElementKey } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ElementBadge({ element }: { element: ElementKey }) {
  const { icon: Icon, color } = ELEMENT_CONFIG[element];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex size-6 items-center justify-center rounded-full ring-1 ring-inset ring-white/10"
          style={{ backgroundColor: `color-mix(in oklch, ${color} 22%, transparent)` }}
        >
          <Icon className="size-3.5" style={{ color }} aria-hidden />
        </span>
      </TooltipTrigger>
      <TooltipContent>{ELEMENT_LABEL[element]}</TooltipContent>
    </Tooltip>
  );
}

export function ElementIcons({ elements }: { elements: ElementKey[] }) {
  if (elements.length === 0) {
    return <span className="text-muted-foreground/50">—</span>;
  }
  const ordered = ELEMENT_ORDER.filter((e) => elements.includes(e));
  return (
    <div className="flex flex-wrap gap-1 w-20">
      {ordered.map((e) => (
        <ElementBadge key={e} element={e} />
      ))}
    </div>
  );
}
