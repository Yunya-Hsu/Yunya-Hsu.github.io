# Yunya — 官方網站規格書

> 給 Claude Code 的說明：這份文件是網站的完整規格，已經和網站主人 Yunya 逐條確認過。
> 開始動工前請先完整讀過。遇到文件沒寫到、或標示 `TODO` 的地方，先問 Yunya，不要自行假設。

---

## 1. 背景與目標

- **網站主人**：Yunya Hsu，插畫家，本職是軟體工程師。**網站任何地方都不放中文名字**，中英文版一律寫「Yunya Hsu」。
- **品牌名**：Yunya
- **社群帳號**：Instagram 和 Threads 都是 `@yours_yunya`
- **網站目的**（依優先順序）：
  1. 給 **Chicago's Old Town Art Fair（OTAF）** 的評審看作品集。Yunya 要申請 **Digital Art** 類別。
  2. 給國外想要接案或合作的人看。
- **不做**：線上商店、販售、聯絡表單、公開 email、部落格。
- **時程**：OTAF 2027 的申請截止日是 **2027 年 1 月 15 日**，網站必須在那之前上線。
  - **內部目標：2026 年 12 月 15 日**正式上線（包含真正的作品）。留一個月緩衝，用來寫信向 OTAF 確認規定，以及在 ZApplication 送件。

## 2. 視覺風格

**參考網站：https://www.cocoshalom.com/**

參考它的風格，不是複製它的內容或品牌：

- **以圖為主**：作品是主角，介面要退到背景。
- **乾淨簡約**：大量留白、版面安靜、沒有多餘的裝飾。
- **文字極少**：只放必要的文字。不要寫標語、不要寫行銷文案。（作品牆上每張作品下方的標題和年份是刻意保留的例外，見 5.2。）
- **作品牆**：首頁就是作品的網格。

設計原則：

- **方向：畫廊牆**（第 3 階段的原型 B）。像一面掛著版畫的牆：溫暖的燕麥色牆面、置中的手寫標誌、小而寬字距的襯線字。
- 介面只用中性的暖灰色，不加其他顏色。作品本身的色彩已經很豐富，介面不要搶色。
- 文字和背景的對比一律符合 WCAG AA（4.5:1 以上）。
- 手機和桌機都要好看（各頁版面見第 5 節）。
- 支援深色模式**不是**需求。

### 2.1 顏色

| 用途 | 數值 | 對比（對背景） |
|---|---|---|
| 背景（牆面） | `#eeeae2` 燕麥色 | — |
| 主要文字 | `#2f2c27` | 11.59:1 |
| 次要文字（年份、媒材、未選取的導覽） | `#625d52` | 5.46:1 |
| 標誌「YOURS,」 | `#857467` 暖灰 | 3.73:1（是標誌圖形的一部分，不是網頁文字，見 2.2） |
| 標誌簽名「Yunya」 | `#4a453d` 深灰 | 7.92:1 |
| 頭像暫代色塊 | `#dcd6ca` | — |
| 作品陰影（作品牆） | `0 1px 2px rgba(60,50,30,.10), 0 6px 18px rgba(60,50,30,.08)` | — |
| 作品陰影（作品頁） | `0 1px 2px rgba(60,50,30,.10), 0 10px 28px rgba(60,50,30,.10)` | — |

作品加上淡淡的陰影，像版畫掛在牆上。作品自己的白色紙邊因此會成為畫面的一部分，這是刻意的。

### 2.2 字型

- **英文：Cormorant Garamond**（開源字型，SIL Open Font License）。
  - 字型檔直接放在網站裡，**不從 Google Fonts 載入**，避免第三方請求。
  - 只放英文字元（Latin subset），4 個檔案：400、400 斜體、500、600。用 `font-display: swap`，並 preload 內文用的 400。
- **中文：系統字型**，不載入中文網路字型。順序是先找宋體（Apple 裝置的 `Songti TC`），沒有的話退回系統黑體（`PingFang TC`、`Microsoft JhengHei`、`Noto Sans TC`）。不使用新細明體。
  - `TODO` macOS 有宋體；iOS 的 Safari 可能不提供 `Songti TC` 給網頁使用，iPhone 上就會顯示黑體。第 4 階段要用真的 iPhone 確認，並把結果寫回這裡。
- 完整的字型順序：`"Cormorant Garamond", "Songti TC", "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", serif`。
- **標誌：「YOURS, Yunya」**，像書信結尾的署名，呼應帳號 `@yours_yunya`。
  - **整個標誌是一張 SVG 圖**，兩行都是圖形，不是網頁文字：
    - 第一行「YOURS,」：用 Cormorant Garamond 600、全大寫、字距 0.32em 排好之後轉成外框（outline），填色 `#857467`。
    - 第二行「Yunya」：Yunya 的手寫簽名，用 potrace 從原稿轉成向量，填色 `#4a453d`。
    - 兩行的相對位置照原型：「YOURS,」靠左、簽名往右縮排 34px、兩行之間 10px（以「YOURS,」11px、簽名 84px 高為基準）。
  - 尺寸：整張 SVG 桌機高 105px、手機高 80px，等比例縮放。
  - 這樣做是因為 2b 的暖灰色對比只有 3.73:1。標誌本來就不受 WCAG 對比限制，但如果「YOURS,」是網頁文字，無障礙自動檢查（axe）會把它當成一般文字並報錯。做成圖形就和標誌的性質一致。
  - 整個標誌是一個回首頁的連結，無障礙名稱是「Yours, Yunya」（`aria-label`）；SVG 設 `aria-hidden`。

### 2.3 文字樣式

| 用途 | 大小 | 樣式 |
|---|---|---|
| 內文 | 17px，行高 1.65 | 400 |
| 導覽列、作品頁的上一張 / 下一張、小標題 | 12px | 600，全大寫，字距 0.28em（中文 0.2em）；上一張 / 下一張字距 0.24em |
| 語言切換「EN / 中」 | 12px | 600，字距 0.1em |
| 分類篩選 | 15px | 斜體；選取的那一項加 1px 底線（距離文字 6px） |
| 作品牆的作品標題 | 15px | 字距 0.12em |
| 作品牆的年份 | 14px | 斜體，次要文字色 |
| 作品頁的標題 | 22px | 500，字距 0.1em |
| 作品頁的年份、媒材、版數 | 15px | 斜體，次要文字色 |
| 關於頁的標題 | 28px | 500，字距 0.12em，下方一條 32px 寬的細線 |
| 頁尾 | 14px | 斜體，次要文字色 |

### 2.4 間距

- 左右邊距：`clamp(16px, 4vw, 64px)`；內容最寬 1440px，置中。
- 頁首：上下各 48px，標誌和導覽之間 18px，導覽項目之間 36px。
- 頁尾：上方 120px，下方 40px。

### 作品本身的風格（供設計參考）

鬆鬆的墨線，搭配水彩、粉蠟筆質地的色彩。題材是旅行街景、咖啡館、書店、樂手、窗邊的人和花卉。整體溫暖、懷舊、有生活感。

## 3. 技術選型

- **框架**：Astro 7.4.x（最新穩定版），TypeScript，輸出純靜態網站。
- **執行環境**：Node 22 LTS（Astro 7 需要 Node 22.23.4 以上），用 nvm 管理，專案放 `.nvmrc`。套件管理用 npm。
- **不使用** React、Vue 等前端框架。只有分類篩選需要用到少量原生 JavaScript。
- **圖片**：使用 Astro 內建的圖片處理（`astro:assets`），自動產生響應式尺寸和 WebP / AVIF 格式。
- **多語系**：使用 Astro 內建的 i18n 路由。
- **字型**：Cormorant Garamond 的字型檔直接放在 repo 裡（見 2.2），不是 npm 套件，也不從外部載入。
- **部署**：GitHub Pages，透過 GitHub Actions（官方的 `withastro/action`）在推送到 `main` 時自動建置與發布。
- **網域**：暫時使用 GitHub Pages 的預設網址，之後會買自訂網域。設定要讓之後切換網域時，只需要改 `astro.config` 的 `site` 和加一個 `CNAME`。
- **Repo**：`Yunya-Hsu/Yunya-Hsu.github.io`，**公開 repo**（免費帳號的 GitHub Pages 需要公開）。
  - 網址：`https://yunya-hsu.github.io/`。網站在根目錄，**不設定 `base`**。
  - 由 Yunya 在 github.com 網頁上建立一個空的 repo（不勾 README、.gitignore、license），再設成 remote。
  - 用 HTTPS 推送；第一次推送時在瀏覽器登入，macOS 鑰匙圈會記住。
- **依賴套件越少越好**。新增任何套件前，先問 Yunya。
- **測試**（開發時一律要附測試）：
  - **Vitest**（`npm test`）：資料驗證、翻譯檔、排序與上一張 / 下一張等邏輯。測試放 `tests/unit/`。
  - **Playwright**（`npm run test:e2e`）：用真的瀏覽器測使用者看得到的行為，例如篩選、`?category=`、沒有 JS 時、鍵盤操作、語言切換、`hreflang`。測試對象是建置後的正式版，桌機和手機各跑一次。測試放 `tests/e2e/`。
  - GitHub Actions 部署前會先跑兩種測試，任何一個失敗就不部署。

## 4. 多語系

- **預設語言是英文**，網址在 `/`。
- **中文（繁體）** 在 `/zh/`。
- 每一頁都有對應的另一語言版本，頁首導覽列的最後放語言切換（見 5.1）。切換時要**停留在同一頁的對應版本**，不要跳回首頁。
- **不依瀏覽器語言自動導向**。英文永遠在 `/`，只靠手動切換。
- `<html lang>` 要正確：英文用 `en`，中文用 `zh-Hant`。
- 每一頁都要有 `hreflang` 的 alternate 連結。
- 介面文字（導覽、按鈕、分類名稱）集中放在一個翻譯檔，不要寫死在元件裡。

## 5. 頁面結構

```
/                       作品牆（英文）
/works/<slug>/          單張作品頁（英文）
/about/                 關於我＋聯絡（英文）
/zh/                    作品牆（中文）
/zh/works/<slug>/       單張作品頁（中文）
/zh/about/              關於我＋聯絡（中文）
/404                    找不到頁面（中英雙語並列，見下方）
```

- GitHub Pages 整個網站只能有一個 `404.html`，所以 404 頁是**一頁中英雙語並列**，裡面放兩個語言首頁的連結。

### 5.1 共用的頁首與頁尾

- **頁首**（全部置中）：
  - 第一行：標誌「YOURS, Yunya」，點擊回首頁（規格見 2.2）。標誌**整塊置中**；「YOURS,」和簽名的相對位置在 SVG 裡固定，不各自置中。
  - 第二行：導覽連結「Work」、「About」，以及語言切換「EN / 中」。目前所在的區塊用主要文字色，並加 1px 底線（距離文字 6px）；其他用次要文字色。
    - 作品牆和單張作品頁：「Work」是目前區塊。
    - 關於頁：「About」是目前區塊。
    - 404 頁：沒有目前區塊。
- **頁尾**（置中）：`© <年份> Yunya Hsu`，下一行是 Instagram、Threads 的連結。保持極簡。

### 5.2 首頁：作品牆

- 首頁直接就是作品牆，沒有大圖橫幅、沒有標語。
- 作品牆上方放分類篩選，置中，和作品牆之間 48px：
  - All 全部
  - Places & Travel 城市與旅行
  - People & Music 人物與音樂
  - Flowers & Still Life 花卉與靜物
- 篩選用原生 JavaScript 即時切換，不重新載入頁面。
- 目前選擇的分類要反映在網址上（例如 `?category=places`），這樣可以分享連結，重新整理後也會保留。
- 沒有 JavaScript 時，要顯示全部作品，網站仍然可以正常使用。
- 作品依照資料裡的排序欄位排列。
- 網格縮圖：
  - **固定比例的網格**：大部分作品是 4:5，所以每一格都是 4:5，順序由左到右，和 `order` 一致。用純 CSS grid，不用 JS。
  - 欄數：手機（小於 600px）1 欄，間距 48px；平板（600px 以上）2 欄，上下 56px、左右 32px；桌機（1024px 以上）3 欄，上下 72px、左右 48px。
  - **不裁切**：比例不是 4:5 的作品（例如 5:4 的橫幅）完整縮放到格子內，**垂直置中**，像畫廊沿著中心線掛畫。
  - 每張作品加上 2.1 的陰影。
  - **每張下方顯示標題和年份**，置中，放在**格子**下方 20px（不是作品下方），所以同一列的標題一律對齊，橫幅作品的標題也一樣（文字樣式見 2.3）。
  - 點擊進入該作品的獨立頁面。
- 圖片要 lazy loading，首屏的圖除外。

### 5.3 單張作品頁

- 版面全部置中：作品在上，資訊在下。
- 大圖顯示作品，加上 2.1 的陰影。高度最多是「螢幕高度減 320px」（頁首約 245px 加上標題），最寬 1000px，讓整張作品和標題都在第一個畫面內。實作時以實際量到的頁首高度為準。
  - 高度**至少保留螢幕高度的 60%**，也就是 `max(60svh, 100svh - 320px)`。橫放的手機這類很矮的螢幕上，作品不會被壓得太小，標題改成往下捲才看得到。
- 作品資訊（置中，文字樣式見 2.3）：
  - 標題
  - 年份
  - 媒材，例如 `Digital illustration`
  - 版數，如果有的話，例如 `Archival pigment print on cotton rag paper · Edition of 25`
- 「上一張 / 下一張」導覽，**一律依照全部作品的 `order` 順序**，不管是從哪個分類點進來的。最後一張的下一張接回第一張，第一張的上一張接到最後一張（循環）。
- 「回到作品牆」連結：回到瀏覽器記住的分類（例如 `sessionStorage`）；沒有記錄或沒有 JS 時，回到 All。
- 支援鍵盤左右鍵切換上一張和下一張。
- 每一頁都有自己的 Open Graph 圖片（就用該作品），分享到社群時會顯示作品。

### 5.4 關於我＋聯絡

- 版面全部置中，最寬 640px：頭像 → 標題「About」和細線 → 自我介紹 → 「Contact」小標題 → 連結。
- 頭像：200px 的圓形，下方 40px。先用 Yunya 的 IG 頭像（抱著貓的自畫像插畫）。`TODO` 圖檔由 Yunya 提供；在那之前先用 `#dcd6ca` 的圓形色塊暫代。
- 自我介紹文字：用下方的定稿，以第一人稱書寫。
- 聯絡方式：只放 Instagram 和 Threads 的連結。**不放 email，不做聯絡表單。**
  - Instagram：`https://www.instagram.com/yours_yunya/`
  - Threads：`https://www.threads.com/@yours_yunya`

#### 自我介紹（定稿）

**English**

> I'm Yunya Hsu, an illustrator based in Taiwan. I draw the quiet moments of everyday life and travel — street corners, café tables, musicians mid-song, flowers by the window — with loose ink lines and layered, textured color.
>
> By day I work as a software engineer. Drawing is how I slow down and pay attention.

**中文**

> 我是 Yunya Hsu，住在台灣的插畫家。我畫日常與旅途中安靜的片刻：街角、咖啡館的桌邊、正在演奏的樂手、窗邊的花。用鬆鬆的墨線，和一層層疊上的色彩質地。
>
> 白天我是軟體工程師；畫畫，是我放慢腳步、好好觀察世界的方式。

## 6. 作品資料

### 6.1 數量與分類

- 放 15 到 24 張，挑最強、風格最一致的作品。
- 分成三類：`places`（城市與旅行）、`people`（人物與音樂）、`flowers`（花卉與靜物）。

### 6.2 資料結構

使用 Astro content collection，每張作品一個 YAML 檔，放在 `src/content/works/`。

- **檔名就是 slug**（網址用的英文代稱），例如 `lisbon-tram.yaml` → `/works/lisbon-tram/`。只能用小寫英文、數字和 `-`。
- **圖檔用同一個檔名**，放在 `src/assets/works/`，例如 `lisbon-tram.jpg`。程式會自動找到對應的圖，資料檔裡不用寫 `slug` 和 `image`。

資料檔的欄位：

| 欄位 | 必填 | 說明 |
|---|---|---|
| `title.en` / `title.zh` | 是 | 中英文標題 |
| `year` | 是 | 創作年份 |
| `category` | 是 | `places`、`people`、`flowers` 三選一 |
| `medium.en` / `medium.zh` | 是 | 媒材，例如 `Digital illustration` / `數位插畫` |
| `edition.en` / `edition.zh` | 否 | 限量版資訊，例如 `Archival pigment print on cotton rag paper · Edition of 25` |
| `alt.en` / `alt.zh` | 是 | 給螢幕閱讀器的圖片描述 |
| `order` | 是 | 排序用的數字，越小越前面 |

用 schema 驗證資料，以下情況建置要失敗，並給出清楚的錯誤訊息（指出是哪一筆、哪個欄位）：

- 缺少必填欄位，或是有拼錯、不認識的欄位
- `order` 重複
- 資料檔找不到同名的圖檔，或圖檔找不到同名的資料檔
- 檔名有大寫、空白等不能放進網址的字元

### 6.3 圖片規則

- 網站上的圖，**長邊最大約 2000 像素**，不加浮水印。看得清楚，但不足以拿去印刷。
- 原始大檔**不要放進 repo**。Yunya 會先匯出長邊約 2000 到 3000 像素的 JPG 再放進來。在 `.gitignore` 排除常見的原始檔格式（例如 `.procreate`、`.psd`、`.tif`）。
- 圖片放在 `src/assets/works/`，檔名和資料檔一致（見 6.2）。

### 6.4 開發時的暫代內容

真正的作品還沒放進來之前，用 6 到 9 張暫代圖片（不同長寬比的純色或漸層塊）和假資料，讓版面可以先做出來。暫代資料要容易一次清除。

- 暫代作品的資料檔和圖檔，檔名都以 `placeholder-` 開頭。清除時刪掉 `src/content/works/placeholder-*` 和 `src/assets/works/placeholder-*` 即可。
- 「暫代內容」包含**暫代作品**和**暫代頭像**：還有任何一張 `placeholder-` 作品，或還沒放入真的頭像（`src/assets/avatar.jpg`）時，都算還有暫代內容。

- 只要網站上還有暫代內容，每一頁都自動加上 `<meta name="robots" content="noindex">`，`robots.txt` 也暫時擋住所有爬蟲。暫代內容清除後，自動恢復成允許所有爬蟲（見第 7 節）。

## 7. SEO 與社群分享

- 每頁都有 `<title>` 和 `meta description`，中英文分開。
  - `<title>` 格式：
    - 首頁：`Yunya Hsu — Illustration` / `Yunya Hsu — 插畫`
    - 作品頁：`<作品標題> — Yunya Hsu`
    - 關於頁：`About — Yunya Hsu` / `關於 — Yunya Hsu`
  - `meta description`：
    - 首頁和關於頁：`Illustrator based in Taiwan. Loose ink lines and textured color — travel, cafés, musicians and flowers.` / `住在台灣的插畫家。鬆鬆的墨線與層疊的色彩質地，畫旅行、咖啡館、樂手與花。`
    - 作品頁：`<標題>, <年份>. <媒材>.`，例如 `Lisbon Tram, 2025. Digital illustration.`
- Open Graph 和 Twitter card：首頁和關於頁用 `order` 最小的那張作品當代表作（不另外加欄位），作品頁用該作品。
- 用 `@astrojs/sitemap` 產生 sitemap，包含兩種語言。
- `robots.txt` 允許所有爬蟲（暫代內容還在時例外，見 6.4）。
- favicon：`TODO`，先用白底黑字的「Y」SVG 圖示暫代。

## 8. 無障礙與效能

- 所有圖片都要有 alt 文字。
- 所有互動元素都能用鍵盤操作，focus 狀態要看得見。
- 文字和背景的對比要符合 WCAG AA。
- 目標：Lighthouse 四項分數都在 95 以上（手機）。
- 不使用任何追蹤或分析工具。

## 9. 開發流程

請照這個順序進行，每完成一個階段就停下來，讓 Yunya 確認後再繼續。每個階段在自己的 branch 開發，經過 Yunya 確認後透過 GitHub PR 合併（規則見 CLAUDE.md）。每個階段的功能都要附上對應的測試，而且全部測試都要通過，才算完成。

1. **建立專案**：初始化 Astro 專案，設定 TypeScript、i18n、sitemap，以及 GitHub Actions 部署流程。
2. **版面骨架**：頁首、頁尾、語言切換，以及三種頁面的基本結構，用暫代內容。
3. **視覺設計**：研究參考網站，用 Yunya 的真正作品（放在本機的 `design-samples/`，不 commit）做 2 到 3 個可以點的視覺方向原型，讓 Yunya 選擇。選定後寫成具體的設計規格（字型、字級、間距、顏色數值、各頁版面），更新到第 2 節。第 4 到 6 階段都照這份規格做。
4. **作品牆和分類篩選**。
5. **單張作品頁**：包含上一張、下一張和鍵盤操作。
6. **關於我頁面**。
7. **SEO、無障礙、效能**：檢查和調整。
8. **部署**：確認 GitHub Pages 上線正常。
9. **放入真正的作品**：清除暫代內容。

## 10. 說明文件

在 `README.md` 寫清楚：

- 如何在本機啟動開發伺服器、如何建置。
- **如何新增一張作品**：放圖到哪裡、資料檔怎麼寫、欄位的意思。要寫到不懂程式的人也看得懂。
- 如何更換手寫簽名（從 PNG 轉成 SVG 的步驟）。
- 之後買了網域，如何切換過去。

## 11. 待辦事項（等 Yunya 提供）

- [x] GitHub 帳號和 repo 名稱：`Yunya-Hsu/Yunya-Hsu.github.io`
- [x] 建立 `Yunya-Hsu.github.io` repo（已建立，公開）
- [x] 手寫簽名「Yunya」：已提供，並已轉成 SVG（第 4 階段放進網站）
- [ ] 作品圖檔和每張作品的資料（標題、年份、媒材、版數）
- [ ] IG 頭像的圖檔
- [x] 中文名字：網站不放中文名字，一律用 Yunya Hsu
- [x] 居住城市，以及自我介紹的最終版本：只寫「台灣」，第一人稱定稿（見 5.4）
- [ ] favicon

## 12. 網站以外的提醒（不屬於開發工作）

- OTAF 的申請透過 ZApplication 送件，申請期間是 2026 年 10 月 1 日到 2027 年 1 月 15 日。
- OTAF 允許數位藝術，但作品必須簽名、編號，以限量版形式製作。同時規定 giclée 屬於複製品、不能販售。送件前請寫信到 info@oldtownartfair.org，確認原生數位作品的限量典藏輸出是否符合規定。
