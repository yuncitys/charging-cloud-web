# Node 22 + Vue CLI 5 升级（Web）

日期：2026-11-03  
Slug：`node22-vue-cli5`  
仓库：`charging-cloud-web`

## 背景

- 本机当前多为 Node 16（nvm default），`package.json` `engines` 仍为 `>=8.9`。
- 构建栈为 **Vue CLI 4.4.4 + webpack 4**；若只升 Node 而不升 CLI，需 `--openssl-legacy-provider` 续命。
- 已确认路线：升到 **Node 22 + Vue CLI 5**；**Vue 3 + Vite 延后**，不在本次范围。
- 本机 nvm 已有 12/16/18/20，**尚无 Node 22**，实施前须用 nvm 安装并统一切换。

## 目标

1. 团队以 **nvm** 管理 Node；本仓库锁定 **Node 22**（`.nvmrc` + `engines`）。
2. `@vue/cli-*` 升到 **5.x**（webpack 5），本地 `dev` / `build:prod` 在 Node 22 下可跑。
3. **不依赖** `NODE_OPTIONS=--openssl-legacy-provider`。
4. 业务保持 **Vue 2.6 + Element UI**；不改业务功能。

## 分支约定

- **禁止**在现有业务分支（如 `feature/refund-record-detail`）上直接改工具链。
- 开工前：从最新 **`main`**（`origin/main`）切出独立分支，建议名：`feature/node22-vue-cli5`。
- 设计/计划文档可随该分支一并提交；勿把本次升级混进其他功能 PR。

## 非目标

- Vue 3、Vite、Element Plus。
- 大范围升级业务依赖（axios 等）——仅当构建硬失败再最小改动。
- 新建正式 CI 流水线（可顺手废弃过时 `.travis.yml` Node 10 配置）。

## Node / nvm 约定

1. 使用 nvm（不推荐系统包管理器与 nvm 混用同一项目）。
2. 首次（或新机器）：
   ```bash
   nvm install 22
   cd <charging-cloud-web>
   nvm use          # 读 .nvmrc
   node -v          # 应为 v22.x
   ```
3. 仓库根目录新增 `.nvmrc`，内容：`22`（或具体补丁如 `22.23.2`；优先主版本 `22`，便于跟 LTS 小版本）。
4. `package.json`：
   ```json
   "engines": {
     "node": ">=22 <23",
     "npm": ">=10"
   }
   ```
5. README「开发」章节补充：必须 Node 22；用 nvm 安装/切换；进入目录后 `nvm use`。
6. 可选：个人将 `nvm alias default 22`；**不强制**改全局 default（避免影响其他仍需 16/18 的项目）。本仓库以 `.nvmrc` + 进目录 `nvm use` 为准。

## 构建栈升级（Vue CLI 4 → 5）

### 依赖（原则）

- `@vue/cli-service` / `@vue/cli-plugin-babel` / `@vue/cli-plugin-eslint` / `@vue/cli-plugin-unit-jest` → **5.x**（同小版本对齐）。
- 随 webpack 5 / PostCSS 8 升级：`sass-loader`、`svg-sprite-loader`、`autoprefixer`；`babel-eslint` → `@babel/eslint-parser`；eslint / `eslint-plugin-vue` 调到 CLI 5 兼容区间。
- 仍保留 `vue@2.6.x` + `vue-template-compiler` 版本一致。
- 移除或替换与 webpack 5 不兼容的插件（重点：`script-ext-html-webpack-plugin` 内联 runtime——不兼容则改用 CLI5/webpack5 等价方案或暂时去掉内联，以构建成功为准）。
- **不加** openssl legacy 到 scripts（升级成功后不应需要）。

### `vue.config.js`

- `devServer.overlay` → webpack-dev-server 4 的 `client.overlay`（或等价）。
- 保留现有：proxy、sass `expanded`、svg sprite（`src/icons`）、splitChunks、Quill `ProvidePlugin`。
- preload / prefetch 行为按 CLI 5 默认再核对，避免无意义报错。

### 原生模块

- `canvas` 等需在 Node 22 下重装/重编；实施时 `rm -rf node_modules` 后按新 Node 重装。若编译失败，再针对性修（系统依赖或换兼容版本），不扩大范围。

## 验收

1. `nvm use` 后 `node -v` 为 22.x。
2. 干净安装依赖成功（含 `canvas` 若仍需要）。
3. `npm run build:prod` 成功产出 `dist/`。
4. `npm run dev` 可启动；现有 API proxy 行为不变。
5. 进程/脚本中**无** `--openssl-legacy-provider`。
6. `npm run lint`（及现有 unit test 若仍可跑）无工具链级阻断；失败仅修工具链相关。

## 风险与回退

| 风险 | 处理 |
|------|------|
| loader / 旧插件与 webpack 5 不兼容 | 按报错定点升级或替换，不重构业务 |
| `script-ext-html-webpack-plugin` 失效 | 去掉 runtime 内联或换维护中的替代 |
| `canvas` 编译失败 | 查编译依赖；必要时评估是否仍必须 |
| 升完无法构建 | 回退分支/提交；临时可退回 Node 16 + CLI4（不作为长期方案） |

## 后续（明确不在本次）

- Vue 3 + Vite 迁移单独立项。
- 正式 CI 镜像锁定 Node 22。
