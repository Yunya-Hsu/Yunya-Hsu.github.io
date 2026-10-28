# CLAUDE.md

Yunya Hsu 的插畫作品集網站（Astro 靜態網站，部署在 GitHub Pages）。

**[SPEC.md](SPEC.md) 是唯一的規格依據。** 動工前先讀；文件沒寫到或標示 `TODO` 的地方，先問 Yunya，不要自行假設。和 Yunya 確認的新決策要寫回 SPEC.md。

**一律用繁體中文回應 Yunya。**

## 指令

```bash
npm run dev        # 開發伺服器 http://localhost:4321/
npm run build      # 型別檢查（astro check）＋建置
npm run preview    # 預覽建置結果
npm test           # Vitest 單元測試（tests/unit/）
npm run test:e2e   # Playwright 瀏覽器測試（tests/e2e/），會自動建置並在 4400 port 預覽
```

Node 版本以 `.nvmrc` 為準（本機和 CI 共用，寫死到 patch 版，因為 Astro 要求 >=22.23.4）。非互動式 shell 不會載入 `~/.zshrc`，執行 npm 前先 `. ~/.nvm/nvm.sh`。

## 開發原則

### 流程

- 照 SPEC.md 第 9 節的階段進行。每完成一個階段就停下來，讓 Yunya 確認後再繼續。
- 每個功能都要附測試：邏輯用 Vitest，使用者看得到的行為用 Playwright。新增頁面時，把它加進 `tests/e2e/a11y.spec.ts` 的頁面清單。
- 全部測試（`npm test`、`npm run test:e2e`）通過，才算完成。

### Git 與 PR

- 主分支是 `main`。
- 新功能、修 bug 等任何變更都要開新的 branch，例如 `feat/work-wall`、`fix/lang-switch`。不要直接 commit 或推送到 `main`。
- 分支合併一律是：推送 branch → 在 GitHub 開 PR → **在 GitHub 上 merge**。**不可以在本機把 branch merge 進 `main`。**
- 開 PR 時，PR 內文用 Matt Pocock 的 `pr` skill（`mattpocock-skills:pr`）撰寫。
- GitHub 上只允許 **squash merge**，合併後自動刪除遠端 branch。`main` 有保護規則：一定要透過 PR，而且 `test` 檢查要通過。
- Yunya 說 PR「merged」之後，馬上：`git switch main` → `git pull --prune` → `git prune` → 確認 `git diff --quiet main <branch>` 沒有差異後，用 `git branch -D <branch>` 刪掉本機 branch（squash 之後 `-d` 會拒絕），再確認 `main` 的部署成功。
- 只有 Yunya 要求時才 commit、推送或開 PR。

### 依賴套件

- 依賴越少越好。新增任何套件前，先問 Yunya。
- 目前刻意不使用 ESLint、Prettier、Husky。如果專案變大，覺得需要這類工具時，**向 Yunya 提出建議並說明理由，不要自行加入**。

### 內容

- 網站不放中文名字，中英文一律寫「Yunya Hsu」。
- 不放 email、不加任何追蹤或分析工具。
- 聯絡頁的表單是 2026-10-26 加入的計畫（SPEC 5.5、第 7 階段）：透過第三方表單服務轉寄，email 不出現在網站上，不用 reCAPTCHA。

## 已知的坑

- **Astro 7 偵測到 AI agent 執行時，會把 `astro dev` / `astro preview` 自動放到背景執行**，脫離原本的程序。所以：
  - Playwright 的 `webServer` 指令要加 `--ignore-lock`，讓伺服器留在前景，測試結束才會被關掉。
  - 自己啟動的伺服器，用完就關掉，把 port 還回來：
    - 沒加 `--ignore-lock`（被放到背景）的：用 `npx astro dev stop` / `npx astro preview stop`。
    - 加了 `--ignore-lock` 的：`stop` 找不到它，改用 `pkill -f "astro preview --port <port>"`，再用 `lsof -nP -iTCP:<port> -sTCP:LISTEN` 確認 port 已經空出來。
- **port 被佔用時，Astro 會自動改用下一個 port**，只在啟動訊息裡寫出實際網址。截圖或量測前，先從啟動訊息確認網址，才不會連到別的（舊的）伺服器。
- 本機的 zsh 開了 `noclobber`：覆寫已經存在的檔案（例如重新寫入 log）要用 `>|`。
