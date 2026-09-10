import Link from "next/link";

const settingItems = [
  { label: "通知", description: "お世話リマインダーの通知設定" },
  { label: "サウンド", description: "効果音・BGMのオン/オフ" },
  { label: "アカウント", description: "登録情報の確認・変更" },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-16">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            設定
          </h1>
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400">
            ← ホームへ戻る
          </Link>
        </div>

        <ul className="flex flex-col gap-3">
          {settingItems.map((item) => (
            <li
              key={item.label}
              className="flex flex-col gap-1 rounded-2xl border border-black/[.08] bg-white px-5 py-4 dark:border-white/[.145] dark:bg-zinc-900"
            >
              <span className="text-lg font-medium text-black dark:text-zinc-50">
                {item.label}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {item.description}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
