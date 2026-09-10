import Link from "next/link";
import { pets } from "@/lib/pets";

export default function MyPage() {
  const totalLevel = pets.reduce((sum, pet) => sum + pet.level, 0);

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-16">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            マイページ
          </h1>
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400">
            ← ホームへ戻る
          </Link>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-black/[.08] bg-white px-6 py-6 dark:border-white/[.145] dark:bg-zinc-900">
          <span className="text-5xl" aria-hidden>
            🙋
          </span>
          <div>
            <p className="text-lg font-medium text-black dark:text-zinc-50">
              トレーナー
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              育てているペット: {pets.length}匹 ・ 合計レベル: {totalLevel}
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-zinc-900">
          {pets.map((pet) => (
            <li
              key={pet.id}
              className="flex items-center justify-between border-b border-black/[.06] py-2 last:border-none dark:border-white/[.08]"
            >
              <span className="text-black dark:text-zinc-50">
                {pet.emoji} {pet.name}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Lv.{pet.level}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
