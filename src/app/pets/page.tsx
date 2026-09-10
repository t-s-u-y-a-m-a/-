import Link from "next/link";
import { pets } from "@/lib/pets";

export default function PetsPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-16">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            ペット一覧
          </h1>
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400">
            ← ホームへ戻る
          </Link>
        </div>

        <ul className="flex flex-col gap-4">
          {pets.map((pet) => (
            <li key={pet.id}>
              <Link
                href={`/pets/${pet.id}`}
                className="flex items-center gap-4 rounded-2xl border border-black/[.08] bg-white px-5 py-4 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:bg-zinc-900 dark:hover:bg-[#1a1a1a]"
              >
                <span className="text-4xl" aria-hidden>
                  {pet.emoji}
                </span>
                <span className="flex flex-col">
                  <span className="text-lg font-medium text-black dark:text-zinc-50">
                    {pet.name}（{pet.species}）
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Lv.{pet.level} ・ {pet.mood}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
