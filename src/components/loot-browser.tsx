"use client";

import { useEffect, useMemo } from "react";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CategoryTabs } from "@/components/category-tabs";
import { FilterSidebar } from "@/components/filter-sidebar";
import {
  LootTable,
  visibleColumns,
  type SortDir,
  type SortField,
} from "@/components/loot-table";
import {
  CATEGORY_ORDER,
  type Category,
  type ElementKey,
  type LootItem,
  type Rarity,
} from "@/lib/types";
import {
  activeFilterCount,
  searchItems,
  selectItems,
  type LootFilters,
} from "@/lib/filter";

const SORT_FIELDS: SortField[] = [
  "rarity",
  "name",
  "type",
  "manufacturer",
  "content",
];

export function LootBrowser({ allItems }: { allItems: LootItem[] }) {
  const [category, setCategory] = useQueryState(
    "cat",
    parseAsStringEnum<Category>([...CATEGORY_ORDER]).withDefault("weapons"),
  );
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [sortField, setSortField] = useQueryState(
    "sort",
    parseAsStringEnum<SortField>(SORT_FIELDS).withDefault("name"),
  );
  const [sortDir, setSortDir] = useQueryState(
    "dir",
    parseAsStringEnum<SortDir>(["asc", "desc"]).withDefault("asc"),
  );
  const [raw, setRaw] = useQueryStates({
    rarity: parseAsArrayOf(parseAsString).withDefault([]),
    elem: parseAsArrayOf(parseAsString).withDefault([]),
    wtype: parseAsArrayOf(parseAsString).withDefault([]),
    maker: parseAsArrayOf(parseAsString).withDefault([]),
    content: parseAsArrayOf(parseAsString).withDefault([]),
    region: parseAsArrayOf(parseAsString).withDefault([]),
    wd: parseAsBoolean.withDefault(false),
    ph: parseAsBoolean.withDefault(false),
  });

  const filters: LootFilters = useMemo(
    () => ({
      rarity: raw.rarity as Rarity[],
      elements: raw.elem as ElementKey[],
      types: raw.wtype,
      manufacturers: raw.maker,
      contents: raw.content,
      regions: raw.region,
      worldDropOnly: raw.wd,
      phospheneOnly: raw.ph,
    }),
    [raw],
  );

  const setFilters = (f: LootFilters) =>
    setRaw({
      rarity: f.rarity,
      elem: f.elements,
      wtype: f.types,
      maker: f.manufacturers,
      content: f.contents,
      region: f.regions,
      wd: f.worldDropOnly,
      ph: f.phospheneOnly,
    });

  // Поиск глобальный: для каждой категории считаем число совпадений с запросом.
  // Категория с 0 совпадений блокируется во вкладках.
  const categoryCounts = useMemo(() => {
    const c = Object.fromEntries(
      CATEGORY_ORDER.map((cat) => [cat, 0]),
    ) as Record<Category, number>;
    const matched = searchItems(allItems, search);
    for (const i of matched) c[i.category]++;
    return c;
  }, [allItems, search]);

  // Если активная категория обнулилась поиском — прыгаем на первую непустую.
  useEffect(() => {
    if (categoryCounts[category] === 0) {
      const next = CATEGORY_ORDER.find((c) => categoryCounts[c] > 0);
      if (next) setCategory(next);
    }
  }, [categoryCounts, category, setCategory]);

  const forCategory = useMemo(
    () => allItems.filter((i) => i.category === category),
    [allItems, category],
  );

  const columns = useMemo(
    () => visibleColumns(category, forCategory),
    [category, forCategory],
  );

  const selected = useMemo(
    () => selectItems(forCategory, { search, filters, sortField, sortDir }),
    [forCategory, search, filters, sortField, sortDir],
  );

  const onSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Смена категории: сбрасываем фасеты (они специфичны для категории).
  const onCategoryChange = (cat: Category) => {
    setCategory(cat);
    setRaw(null);
  };

  const filterCount = activeFilterCount(filters);

  return (
    <div className="space-y-8">
      {/* Название сайта — в самом верху */}
      <p className="text-center text-2xl font-bold uppercase tracking-[0.2em] text-muted-foreground sm:text-3xl">
        Borderlands 4 — База данных
      </p>

      {/* Поиск по всем категориям сразу */}
      <div className="mx-auto w-full max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value || null)}
            placeholder="Поиск по всем категориям…"
            className="h-11 rounded-full pl-9"
          />
        </div>
      </div>

      {/* Вкладки категорий (пустые по текущему поиску — заблокированы) */}
      <CategoryTabs
        active={category}
        counts={categoryCounts}
        onChange={onCategoryChange}
      />

      {/* Кнопка фильтров для мобильных */}
      <div className="flex justify-end lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="size-4" />
              Фильтры
              {filterCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {filterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>Фильтры</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-8">
              <FilterSidebar
                items={forCategory}
                category={category}
                filters={filters}
                onChange={setFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Сайдбар фильтров — десктоп */}
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6">
            <FilterSidebar
              items={forCategory}
              category={category}
              filters={filters}
              onChange={setFilters}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {selected.length > 0 ? (
            <LootTable
              items={selected}
              category={category}
              columns={columns}
              sortField={sortField}
              sortDir={sortDir}
              onSort={onSort}
            />
          ) : (
            <div className="rounded-xl border bg-card/40 py-20 text-center text-muted-foreground">
              Ничего не найдено. Попробуй изменить поиск или фильтры.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
