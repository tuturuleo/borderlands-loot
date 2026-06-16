import { Suspense } from "react";
import { LootBrowser } from "@/components/loot-browser";
import { items } from "@/lib/data";

export default function Home() {
  return (
    <main className="lg:h-dvh lg:overflow-hidden">
      <Suspense fallback={null}>
        <LootBrowser allItems={items} />
      </Suspense>
    </main>
  );
}
