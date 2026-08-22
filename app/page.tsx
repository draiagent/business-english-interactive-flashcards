"use client";
/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type Card = { word: string; definition: string; stars: string; score: string; category: string; partOfSpeech: string; forms: string; collocations: string; example: string };
type Rating = "again" | "hard" | "good" | "easy";
type Counts = Record<Rating, number>;

const INITIAL_COUNTS: Counts = { again: 0, hard: 0, good: 0, easy: 0 };
const CATEGORY_IMAGES: Record<string, string> = {
  "營運管理": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=82",
  "辦公日常": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82",
  "一般專業": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=82",
  "人力資源": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=82",
  "旅遊與交通": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=82",
  "法務合規與安全": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=82",
  "金融與會計": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=82",
  "科技與技術支援": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=82",
  "溝通互動": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=82",
};
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=82";

const Icon = ({ name, size = 20 }: { name: "sound" | "upload" | "info" | "spark" | "close"; size?: number }) => {
  const paths = {
    sound: <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a8.5 8.5 0 0 1 0 12"/></>,
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 14v5h14v-5"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.5h.01"/></>,
    spark: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></>,
    close: <><path d="m6 6 12 12"/><path d="M18 6 6 18"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; } else quoted = !quoted; }
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && text[i + 1] === "\n") i += 1; row.push(cell); if (row.some((value) => value.trim())) rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  row.push(cell); if (row.some((value) => value.trim())) rows.push(row); return rows;
}

function rowsToCards(text: string): Card[] {
  const rows = parseCsv(text.replace(/^\uFEFF/, "")); if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim()); const key = (name: string) => headers.indexOf(name);
  const required = ["單字", "中文定義", "詞性", "例句"];
  if (required.some((name) => key(name) < 0)) throw new Error("CSV 缺少必要欄位：單字、中文定義、詞性或例句");
  return rows.slice(1).map((values) => ({
    word: values[key("單字")]?.trim() || "", definition: values[key("中文定義")]?.trim() || "—",
    stars: values[key("星級")]?.trim() || "", score: values[key("多益分數區間")]?.trim() || values[key("分數區間")]?.trim() || "",
    category: values[key("分類")]?.trim() || "一般專業", partOfSpeech: values[key("詞性")]?.trim() || "",
    forms: values[key("【詞性變化】")]?.trim() || "—", collocations: values[key("搭配詞")]?.trim() || "—",
    example: values[key("例句")]?.trim() || "—",
  })).filter((card) => card.word);
}

function splitExample(example: string) {
  const lines = example.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return { english: lines[0] || "—", chinese: lines.slice(1).join(" ") || "" };
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]); const [index, setIndex] = useState(0); const [revealed, setRevealed] = useState(false);
  const [counts, setCounts] = useState<Counts>(INITIAL_COUNTS); const [helpOpen, setHelpOpen] = useState(false); const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(""); const [error, setError] = useState(""); const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("toeic-card-progress-v1");
    if (saved) { try { const data = JSON.parse(saved) as { index?: number; counts?: Counts }; queueMicrotask(() => { setIndex(Math.max(0, data.index || 0)); if (data.counts) setCounts({ ...INITIAL_COUNTS, ...data.counts }); }); } catch { /* Invalid local progress is ignored. */ } }
    fetch("/business_english_vocab.csv").then((response) => { if (!response.ok) throw new Error("字庫載入失敗"); return response.text(); })
      .then((text) => setCards(rowsToCards(text))).catch((loadError: Error) => setError(loadError.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (!loading && cards.length) localStorage.setItem("toeic-card-progress-v1", JSON.stringify({ index, counts })); }, [index, counts, loading, cards.length]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (helpOpen) { if (event.key === "Escape") setHelpOpen(false); return; }
      if (event.code === "Space") { event.preventDefault(); setRevealed((value) => !value); }
      if (revealed && ["1", "2", "3", "4"].includes(event.key)) {
        const rating = ({ "1": "again", "2": "hard", "3": "good", "4": "easy" } as const)[event.key as "1" | "2" | "3" | "4"]; rate(rating);
      }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  const safeIndex = cards.length ? index % cards.length : 0; const card = cards[safeIndex];
  const example = useMemo(() => splitExample(card?.example || ""), [card]); const progress = cards.length ? ((safeIndex + 1) / cards.length) * 100 : 0;

  function speak(text: string, event?: { stopPropagation(): void }) {
    event?.stopPropagation(); if (!("speechSynthesis" in window) || !text) { setNotice("此瀏覽器不支援語音播放"); return; }
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "en-US"; utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices(); utterance.voice = voices.find((voice) => voice.lang.startsWith("en")) || null; window.speechSynthesis.speak(utterance);
  }
  function rate(rating: Rating) { setCounts((current) => ({ ...current, [rating]: current[rating] + 1 })); setIndex((current) => cards.length ? (current + 1) % cards.length : 0); setRevealed(false); }
  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; setError("");
    file.text().then((text) => { try { const imported = rowsToCards(text); if (!imported.length) throw new Error("CSV 中沒有可用的單字資料"); setCards(imported); setIndex(0); setCounts(INITIAL_COUNTS); setRevealed(false); setNotice(`已匯入 ${imported.length.toLocaleString("zh-TW")} 張單字卡`); } catch (importError) { setError(importError instanceof Error ? importError.message : "CSV 解析失敗"); } event.target.value = ""; });
  }
  function cardKeyDown(event: KeyboardEvent<HTMLDivElement>) { if (event.key === "Enter") setRevealed((value) => !value); }

  if (loading) return <main className="center-state"><div className="loader"/><p>正在載入商務英語字庫…</p></main>;
  if (error && !cards.length) return <main className="center-state"><div className="error-mark">!</div><h1>無法載入單字卡</h1><p>{error}</p><button className="primary-button" onClick={() => location.reload()}>重新載入</button></main>;

  return <main className="study-shell">
    <section className="study-app" aria-label="商務英語互動單字卡">
      <header className="study-header">
        <div className="brand-block"><span className="eyebrow">BUSINESS ENGLISH LAB</span><span className="brand-title">商務英語互動單字卡</span></div>
        <div className="session-status">
          <div className="numbers" aria-label={`目前第 ${safeIndex + 1} 張，共 ${cards.length} 張`}><strong>{(safeIndex + 1).toLocaleString("zh-TW")} <span>/</span> {cards.length.toLocaleString("zh-TW")}</strong><span className="count count-again" title="Again 次數">{counts.again}</span><span className="count count-hard" title="Hard 次數">{counts.hard}</span><span className="count count-good" title="Good 次數">{counts.good}</span><span className="count count-easy" title="Easy 次數">{counts.easy}</span></div>
          <div className="progress-track" role="progressbar" aria-label="字卡進度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><div className="progress-value" style={{ width: `${progress}%` }}/></div>
        </div>
        <div className="header-actions"><input ref={uploadRef} type="file" accept=".csv,text/csv" onChange={handleUpload} hidden/><button className="icon-button" onClick={() => uploadRef.current?.click()} aria-label="上傳 CSV 字庫" title="上傳 CSV 字庫"><Icon name="upload"/></button><button className="icon-button" onClick={() => setHelpOpen(true)} aria-label="使用說明" title="使用說明"><Icon name="info"/></button></div>
      </header>

      <div className={`flashcard-wrap ${revealed ? "is-revealed" : ""}`} role="button" tabIndex={0} onClick={() => setRevealed((value) => !value)} onKeyDown={cardKeyDown} aria-label={revealed ? "點擊返回單字正面" : "點擊顯示答案"}>
        {!revealed ? <article className="flashcard front-card">
          <div className="front-topline"><span className="category-pill">{card.category}</span><span className="score-pill">LEVEL {card.score}</span></div>
          <div className="word-lockup"><h1>{card.word}</h1><button className="sound-button large" onClick={(event) => speak(card.word, event)} aria-label={`播放 ${card.word} 發音`}><Icon name="sound" size={30}/></button></div>
          <div className="front-hint"><span className="keycap">SPACE</span> 顯示答案</div>
        </article> : <article className="flashcard back-card">
          <div className="image-frame">{/* Remote category photography intentionally stays a native responsive image. */}<img src={CATEGORY_IMAGES[card.category] || FALLBACK_IMAGE} alt={`${card.word}：${card.category}情境圖片`}/><div className="image-word"><span>{card.word}</span><span>{"★".repeat(Math.min(5, Number(card.stars) || 0))}</span></div></div>
          <div className="answer-body"><div className="definition-line"><strong>{card.word}</strong> <span className="pos">({card.partOfSpeech})</span> {card.definition}</div><Detail label="詞性變化" text={card.forms}/><Detail label="常用搭配" text={card.collocations}/><div className="example-box"><button className="sound-button" onClick={(event) => speak(example.english, event)} aria-label="播放英文例句"><Icon name="sound" size={20}/></button><div><p>{example.english}</p>{example.chinese && <p className="translation">{example.chinese}</p>}</div></div></div>
          <div className="rating-bar" onClick={(event) => event.stopPropagation()}><RatingButton label="Again" keyHint="1" tone="again" onClick={() => rate("again")}/><RatingButton label="Hard" keyHint="2" tone="hard" onClick={() => rate("hard")}/><RatingButton label="Good" keyHint="3" tone="good" onClick={() => rate("good")}/><RatingButton label="Easy" keyHint="4" tone="easy" onClick={() => rate("easy")}/></div>
        </article>}
      </div>
      <footer className="study-footer"><span><Icon name="spark" size={17}/> 點卡片或按 <span className="keycap">SPACE</span> 翻面</span><span>進度會自動儲存在此裝置</span></footer>
    </section>
    {notice && <div className="toast" role="status" onAnimationEnd={() => setNotice("")}>{notice}</div>}
    {error && cards.length > 0 && <div className="toast error-toast" role="alert">{error}<button onClick={() => setError("")} aria-label="關閉">×</button></div>}
    {helpOpen && <div className="modal-backdrop" onMouseDown={() => setHelpOpen(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">QUICK GUIDE</span><h2 id="help-title">使用說明</h2></div><button className="icon-button" onClick={() => setHelpOpen(false)} aria-label="關閉說明"><Icon name="close"/></button></div><ol className="help-steps"><li><b>看單字、聽發音</b><span>點藍色喇叭播放美式英文發音。</span></li><li><b>翻面核對答案</b><span>點卡片或按 Space，查看中文、詞性、搭配詞與例句。</span></li><li><b>評估熟悉程度</b><span>按 Again、Hard、Good、Easy，或使用數字鍵 1–4。</span></li><li><b>更換自己的字庫</b><span>點右上角上傳按鈕；CSV 欄位需與原始字庫一致。</span></li></ol><button className="primary-button full" onClick={() => setHelpOpen(false)}>開始學習</button></section></div>}
  </main>;
}

function Detail({ label, text }: { label: string; text: string }) { return <div className="detail-line"><span>{label}</span><p>{text}</p></div>; }
function RatingButton({ label, keyHint, tone, onClick }: { label: string; keyHint: string; tone: Rating; onClick: () => void }) { return <button className={`rating-button ${tone}`} onClick={onClick}><span>{label}</span><small>{keyHint}</small></button>; }
