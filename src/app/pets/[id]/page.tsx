import Link from "next/link";
import { notFound } from "next/navigation";
import { getPetById, pets } from "@/lib/pets";

export function generateStaticParams() {
  return pets.map((pet) => ({ id: pet.id }));
}

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pet = getPetById(id);

  if (!pet) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-16">
        <Link href="/pets" className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400">
          ← 一覧へ戻る
        </Link>

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-black/[.08] bg-white px-8 py-10 text-center dark:border-white/[.145] dark:bg-zinc-900">
          <span className="text-7xl" aria-hidden>
            {pet.emoji}
          </span>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            {pet.name}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">{pet.species}</p>

          <dl className="mt-4 grid w-full max-w-xs grid-cols-2 gap-y-3 text-left">
            <dt className="text-zinc-600 dark:text-zinc-400">レベル</dt>
            <dd className="text-black dark:text-zinc-50">Lv.{pet.level}</dd>
            <dt className="text-zinc-600 dark:text-zinc-400">きげん</dt>
            <dd className="text-black dark:text-zinc-50">{pet.mood}</dd>
            <dt className="text-zinc-600 dark:text-zinc-400">満腹度</dt>
            <dd className="text-black dark:text-zinc-50">{pet.hunger}%</dd>
          </dl>
        </div>
      </main>
    </div>
  );
}
