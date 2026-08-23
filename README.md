# AI Agent 商務英語互動單字卡

Business English Interactive Flashcards

AI 時代採用 Agent 生成一套以商務英語與職場溝通為核心的開源互動單字卡，整合英文發音、中文定義、詞性變化、常用搭配詞、中英例句、圖片情境、學習進度與熟悉度評估。

## 線上展示

[立即開啟互動單字卡](https://toeic-vocab-cards.cgm-coach.chatgpt.site)

> 線上展示版本與本開源範例字庫可能不同；公開 Repo 僅附可自由使用的示範資料。

## 核心功能

- 載入預設 CSV 英語字庫
- 上傳相同格式的自訂 CSV 字庫
- 點擊卡片或按 `Space` 翻面
- 播放英文單字與英文例句發音
- 顯示中文定義、詞性、詞性變化與常用搭配詞
- 顯示中英文例句與分類情境圖片
- `Again`、`Hard`、`Good`、`Easy` 四級熟悉度評估
- 使用數字鍵 `1`–`4` 快速評分
- 自動儲存目前裝置的學習進度
- 支援桌機、平板與手機版面
- 支援鍵盤操作與基本無障礙標示

## 快捷鍵

| 按鍵 | 功能 |
|---|---|
| `Space` | 翻開或關閉答案 |
| `1` | Again，需要重新學習 |
| `2` | Hard，仍不熟悉 |
| `3` | Good，基本掌握 |
| `4` | Easy，已經熟悉 |
| `Esc` | 關閉使用說明 |

## CSV 字庫格式

CSV 第一列需包含以下欄位：

```csv
單字,中文定義,星級,分數區間,分類,詞性,【詞性變化】,搭配詞,例句
```

程式亦相容原始欄位名稱 `多益分數區間`。必要欄位為：

- `單字`
- `中文定義`
- `詞性`
- `例句`

預設示範字庫位於：

```text
public/business_english_vocab.csv
```

若例句需要同時顯示英文與中文，請在同一個 CSV 儲存格中以換行分隔：

```text
Please inform the manager if you are going to be late.
如果你會遲到，請通知經理。
```

## 本機安裝

### 環境需求

- Node.js `22.13.0` 或以上版本
- npm

### 安裝與啟動

```bash
git clone https://github.com/draiagent/business-english-interactive-flashcards.git
cd business-english-interactive-flashcards
npm install
npm run dev
```

依終端機顯示的本機網址開啟網站。

### 正式建置

```bash
npm run build
```

### 程式檢查

```bash
npm run lint
npm test
```

## 資料與隱私

- 學習進度保存在目前裝置的瀏覽器儲存空間。
- 使用者上傳的 CSV 只在目前瀏覽器工作階段中處理。
- 本專案不會主動將學習紀錄或 CSV 內容上傳至外部伺服器。
- 清除瀏覽器資料後，本機學習進度可能被移除。

## 技術架構

- TypeScript
- React 19
- Next.js 16 相容介面
- Vinext
- Vite
- Tailwind CSS
- Cloudflare Worker Runtime
- Web Speech API

## 專案分類

- Education
- EdTech
- Language Learning
- Business English
- Interactive Web Application

## 開源授權

程式碼與內附示範字庫採用 [MIT License](LICENSE)。使用者自行加入的資料不會自動取得相同授權，詳見 [DATA_NOTICE.md](DATA_NOTICE.md)。

## 商標聲明

TOEIC® is a registered trademark of ETS. This product is not endorsed or approved by ETS.

TOEIC® 為 ETS 的註冊商標。本專案為獨立開源學習工具，未獲 ETS 背書或核准。本專案不包含 ETS 官方試題，也不使用 ETS 或 TOEIC 官方標誌。

## 作者

AI 教練益力康陳董

- 企業 AI 導入與生成式 AI 教學
- 大學及產業業界講師
- 國家級高爾夫球教練
- CGM Coach 血糖教練
- GitHub：[@draiagent](https://github.com/draiagent)

## 後續規劃

- 真正的間隔重複學習排程
- 分數區間與分類篩選
- 隨機學習與錯題複習模式
- 學習統計儀表板
- 字庫匯出與備份
- PWA 離線學習
- 多裝置進度同步

歡迎透過 Issue 提出建議，或使用 Pull Request 參與改進。
