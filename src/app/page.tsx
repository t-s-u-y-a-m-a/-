import Link from "next/link";

const navItems = [
  {
    href: "/pets",
    label: "ペット一覧",
    description: "育てているペットの一覧と詳細を見る",
    icon: "🐾",
  },
  {
    href: "/mypage",
    label: "マイページ",
    description: "プロフィールとこれまでの実績を確認する",
    icon: "🙋",
  },
  {
    href: "/settings",
    label: "設定",
    description: "通知や表示などアプリの設定を変更する",
    icon: "⚙️",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16 sm:px-16">
        <header className="flex flex-col items-center gap-2 text-center">
          <span className="text-5xl">🐣</span>
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            てんのお世話ゲーム
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            今日もペットのお世話をしよう！
          </p>
        </header>

        <nav aria-label="メインメニュー" className="flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-2xl border border-black/[.08] bg-white px-5 py-4 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:bg-zinc-900 dark:hover:bg-[#1a1a1a]"
            >
              <span className="text-3xl" aria-hidden>
                {item.icon}
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-medium text-black dark:text-zinc-50">
                  {item.label}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </span>
              </span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
