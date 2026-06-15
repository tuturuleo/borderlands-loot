"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ElementIcons } from "@/components/element-icons";
import { ItemThumbnail } from "@/components/item-thumbnail";
import { SourceTags } from "@/components/source-tags";
import { RARITY_TEXT_CLASS } from "@/lib/rarity";
import type { Category, LootItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export type SortField =
  | "rarity"
  | "name"
  | "type"
  | "manufacturer"
  | "content";
export type SortDir = "asc" | "desc";

type ColumnKey =
  | "rarity"
  | "name"
  | "type"
  | "manufacturer"
  | "elements"
  | "content"
  | "sources";

const SORTABLE: Record<ColumnKey, SortField | null> = {
  rarity: "rarity",
  name: "name",
  type: "type",
  manufacturer: "manufacturer",
  elements: null,
  content: "content",
  sources: null,
};

function typeLabel(item: LootItem): string {
  return item.typeEn || item.type;
}

// Какие колонки показываем — зависит от наличия данных в категории.
export function visibleColumns(
  category: Category,
  list: LootItem[],
): ColumnKey[] {
  const cols: ColumnKey[] = ["rarity", "name"];
  const distinctTypes = new Set(list.map(typeLabel));
  if (distinctTypes.size > 1) cols.push("type");
  if (list.some((i) => i.manufacturer)) cols.push("manufacturer");
  if (category === "weapons") cols.push("elements");
  cols.push("content", "sources");
  return cols;
}

function headerLabel(col: ColumnKey, category: Category): string {
  switch (col) {
    case "rarity":
      return "Rarity";
    case "name":
      return "Name";
    case "type":
      return category === "weapons" ? "Weapon Type" : "Type";
    case "manufacturer":
      return "Manufacturer";
    case "elements":
      return "Elements";
    case "content":
      return "Content";
    case "sources":
      return "Sources";
  }
}

function SortHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  field: SortField | null;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
  className?: string;
}) {
  if (!field) {
    return <TableHead className={className}>{label}</TableHead>;
  }
  const active = sortField === field;
  const Icon = !active ? ChevronsUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex items-center gap-1 font-semibold transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon
          className={cn("size-3.5", active ? "opacity-100" : "opacity-40")}
        />
      </button>
    </TableHead>
  );
}

export function LootTable({
  items,
  category,
  columns,
  sortField,
  sortDir,
  onSort,
}: {
  items: LootItem[];
  category: Category;
  columns: ColumnKey[];
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card/40">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <SortHeader
                key={col}
                label={headerLabel(col, category)}
                field={SORTABLE[col]}
                sortField={sortField}
                sortDir={sortDir}
                onSort={onSort}
                className={col === "rarity" ? "w-[88px]" : undefined}
              />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="align-middle">
              {columns.map((col) => (
                <TableCell key={col} className="py-4">
                  {renderCell(col, item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function renderCell(col: ColumnKey, item: LootItem) {
  switch (col) {
    case "rarity":
      return <ItemThumbnail item={item} />;
    case "name":
      return (
        <Link
          href={`/item/${item.id}`}
          className={cn(
            "font-semibold hover:underline",
            RARITY_TEXT_CLASS[item.rarity],
          )}
        >
          {item.name}
        </Link>
      );
    case "type":
      return <span className="text-sm">{typeLabel(item)}</span>;
    case "manufacturer":
      return (
        <span className="text-sm">
          {item.manufacturer ?? (
            <span className="text-muted-foreground/50">—</span>
          )}
        </span>
      );
    case "elements":
      return <ElementIcons elements={item.elements} />;
    case "content":
      return <span className="text-sm">{item.content}</span>;
    case "sources":
      return <SourceTags sources={item.sources} />;
  }
}
