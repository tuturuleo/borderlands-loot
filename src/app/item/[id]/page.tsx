import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ElementIcons } from "@/components/element-icons";
import { ItemThumbnail } from "@/components/item-thumbnail";
import { SourceTags } from "@/components/source-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getItemById, items } from "@/lib/data";
import { RARITY_TEXT_CLASS } from "@/lib/rarity";
import { CATEGORY_LABEL, RARITY_LABEL, type LootItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return items.map((i) => ({ id: i.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getItemById(id);
  if (!item) return { title: "Не найдено — Borderlands 4" };
  return {
    title: `${item.name} (${item.nameEn}) — Borderlands 4`,
    description: item.feature || `${item.type} · ${item.content}`,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item: LootItem | undefined = getItemById(id);
  if (!item) notFound();

  const dash = <span className="text-muted-foreground/50">—</span>;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/">
          <ArrowLeft className="size-4" />К списку
        </Link>
      </Button>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <ItemThumbnail item={item} size={140} className="rounded-xl" />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("border-current", RARITY_TEXT_CLASS[item.rarity])}
            >
              {RARITY_LABEL[item.rarity]}
            </Badge>
            <Badge variant="secondary">{CATEGORY_LABEL[item.category]}</Badge>
          </div>
          <div>
            <h1
              className={cn(
                "text-3xl font-bold",
                RARITY_TEXT_CLASS[item.rarity],
              )}
            >
              {item.name}
            </h1>
            {item.nameEn && (
              <p className="text-lg text-muted-foreground">{item.nameEn}</p>
            )}
          </div>
          {item.feature && (
            <p className="rounded-lg bg-secondary/60 p-3 text-sm leading-relaxed">
              {item.feature}
            </p>
          )}
          {item.lootlemonUrl && (
            <Button asChild variant="outline" size="sm">
              <a
                href={item.lootlemonUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть на lootlemon
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        <Field label="Тип">{item.type || dash}</Field>
        <Field label="Производитель">{item.manufacturer ?? dash}</Field>
        <Field label="Контент">{item.content}</Field>
        {item.category === "weapons" && (
          <Field label="Стихии">
            <ElementIcons elements={item.elements} />
          </Field>
        )}
        <Field label="Регион">{item.region ?? dash}</Field>
        <Field label="Локация">{item.location ?? dash}</Field>
        <Field label="Тип босса">{item.bossType ?? dash}</Field>
        <Field label="World Drop">
          {item.worldDrop
            ? item.worldDropDlcOnly
              ? "Да (только DLC)"
              : "Да"
            : "Нет"}
        </Field>
        <Field label="Фосфен">
          {item.phosphene === null ? dash : item.phosphene ? "Да" : "Нет"}
        </Field>
      </dl>

      <Separator className="my-8" />

      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Источники
        </h2>
        <SourceTags sources={item.sources} />
      </div>
    </main>
  );
}
