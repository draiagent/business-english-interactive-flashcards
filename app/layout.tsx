import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "商務英語互動單字卡",
  description: "結合發音、詞性變化、搭配詞、中英例句與四級熟悉度評估的商務英語互動字卡。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
