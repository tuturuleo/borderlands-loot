import { Suspense } from "react";
import { LootBrowser } from "@/components/loot-browser";
import { items } from "@/lib/data";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <Suspense fallback={null}>
        <LootBrowser allItems={items} />
      </Suspense>
    </main>
  );
}
