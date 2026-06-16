"use client";

import { CircleHelp, ExternalLink, Mail } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CONTACT_EMAIL, SHEET_URL } from "@/lib/config";

export function HelpMenu() {
  return (
    <HoverCard openDelay={100} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label="Справка"
          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <CircleHelp className="size-5" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-auto min-w-64 p-2">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-2 text-sm transition-colors hover:bg-secondary"
        >
          <Mail className="size-4 text-muted-foreground" />
          Связаться с разработчиком
        </a>
        <a
          href={SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-2 text-sm transition-colors hover:bg-secondary"
        >
          <ExternalLink className="size-4 text-muted-foreground" />
          Исходная гугл-таблица
        </a>
      </HoverCardContent>
    </HoverCard>
  );
}
