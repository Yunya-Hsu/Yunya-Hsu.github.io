# CLAUDE.md

Yunya Hsu 的插畫作品集網站（Astro 靜態網站，部署在 GitHub Pages）。

**[SPEC.md](SPEC.md) 是唯一的規格依據。** 動工前先讀；文件沒寫到或標示 `TODO` 的地方，先問 Yunya，不要自行假設。和 Yunya 確認的新決策要寫回 SPEC.md。

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
- 不放 email、不做聯絡表單、不加任何追蹤或分析工具。

## 已知的坑

- **Astro 7 偵測到 AI agent 執行時，會把 `astro dev` / `astro preview` 自動放到背景執行**，脫離原本的程序。所以：
  - Playwright 的 `webServer` 指令要加 `--ignore-lock`，讓伺服器留在前景，測試結束才會被關掉。
  - 自己啟動過伺服器的話，用 `npx astro dev stop` / `npx astro preview stop` 關掉，不要留著佔用 port。
