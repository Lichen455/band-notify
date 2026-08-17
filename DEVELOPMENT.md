# DSH 插件开发规范指引

本仓库（band-notify）本身就是一个 DSH（DeepSeek Harness）常驻双端插件的参考实现。下面的索引帮你快速找到官方规范、社区教程和本项目用到的关键技术点。

---

## 一、官方文档（deepseek-ai/deepseek-harness）

> 官方文档随源码仓库发布，安装包里不带。以下链接都在 GitHub 上（`main` / `master` 分支，均有中英文版）。

### 入门

- [Cordis Primer（Cordis 基础）](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cordis-primer.md) · [中文版](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cordis-primer.zh.md)
  - DSH 的一切能力都是 Cordis 插件：`cordis.yml` 里的一行 = 一个插件；插件 = `{ name, apply(ctx) }`。

### 开发规范（docs/user/develop/）

| 文档 | 内容 | 对应本插件 |
|---|---|---|
| [basic/tool.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/tool.md) | 工具（Tool）开发规范 | —— |
| [basic/config.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/config.md) | 插件配置规范 | settings 命名空间 |
| [basic/publish.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md) | 插件发布规范（npm 包、dsh.client 声明） | 本插件即按此形态打包 |
| [framework/events.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/framework/events.md) | 事件（Event）规范 | 监听 `agent/turn-stopping`、`agent/inbox/claimed` |
| [framework/service.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/framework/service.md) | 服务（Service）规范 | `webServer` 路由、`settings` |
| [practice/llm-adapter.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/practice/llm-adapter.md) | LLM 适配器实践 | AI 总结调用 `llm.stream` |

### 其它官方资料

- [cookbook/adding-a-tool.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-tool.md) — 加一个工具
- [cookbook/extension-cookbook.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/extension-cookbook.md) — 扩展手册
- [cordis-tutorial/04-events.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cordis-tutorial/04-events.md) — 事件教程

---

## 二、部署内置规范（随 DSH 安装）

开发/修改插件时，让会话内的 AI 加载这些 Skill，它们就是当前版本的权威规范：

- **cordis-plugin-development**：动态插件开发全流程（Inspect → define → run → 诊断修复），Host/Client 平台选择、服务/事件/插槽契约查询
- **editing-cordis-compositions**：组合编辑规范——宿主组合 vs 代理预设的分层、发布服务的行必须 isolate 或留在宿主、`agent-presets` 目录只读不可改

## 三、社区资源

- [dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) — 含 [developing-dsh-plugins.md](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/docs/developing-dsh-plugins.md) 和 [dsh-plugin-development Skill](https://raw.githubusercontent.com/NanmiCoder/dsh-agent-teams/master/skills/dsh-plugin-development/SKILL.md)
- [hello-dsh](https://github.com/pingfanfan/hello-dsh) — 零基础插件开发教程（22 个中文技能实例）
- [plugin-registry](https://github.com/vlln/plugin-registry) — DSH 插件生态基建（浏览器面板管理插件 + make-dsh-plugin 引导）
- [dsh-forge](https://github.com/zhn1100/dsh-forge) — 可复现的插件开发环境
- [dsh-TUI plugins 文档](https://github.com/ccch1mneyyy/dsh-TUI/blob/main/docs/plugins.md)

---

## 四、本插件用到的关键技术点（参考实现）

**常驻双端插件结构**

```
plugin/
├── index.js     # 宿主：事件监听 → 模板渲染 → 发送（Node 进程内）
├── client.js    # 浏览器端：铃铛 + 插件配置卡
└── package.json # 包定义，含 dsh.client 声明（浏览器模块注册）
```

| 技术点 | 说明 |
|---|---|
| 浏览器端格式 | `window.__ModuleLoader__.load({ id, factory(require) })`，`require("react")` 由内核模块表提供，可手写无需构建 |
| client → 宿主通信 | 宿主注册 `webServer` 精确路由（如 `/api/band-notify/config`），浏览器用原生 `fetch` |
| 配置持久化 | `ctx.settings` 命名空间（`settings.yaml` 的 `band-notify:` 段），`installSettingsSection` 注册 |
| 常驻安装 | 包放 `$DSH_HOME/profiles/web/<name>/` + 两个 junction（loader 解析 / 浏览器模块扫描）+ `cordis.patch.yml` 补丁行 |
| 事件监听 | 宿主行监听 `agent/turn-stopping`（轮次结束）、`agent/inbox/claimed`（开始计时） |
| 生命周期 | `ctx.on` 注册的监听随 fiber 自动回收；通知用 fire-and-forget 不阻塞轮次关闭 |
| 可观测性 | 心跳日志（`appendFileSync`）便于排查 |

**安全提醒**：仓库内不要提交真实配置（频道名/令牌/密钥），用 `config.example.json` 模板；公共 ntfy 频道消息公开可见，勿发隐私。

---

## 五、给新插件开发者的建议流程

1. 先在会话里让 AI 加载 **cordis-plugin-development** Skill，用 `cordis_inspect_list/query` 查真实契约（服务/事件/插槽），别猜 API
2. 小步验证：先动态插件（`cordis_define` + `cordis_run`）跑通，再决定是否需要常驻化
3. 常驻化前读 **editing-cordis-compositions** Skill，确认行放宿主还是预设、是否涉及服务发布
4. 按官方 `basic/publish.md` 打包（npm 包 + `dsh.client`），确保别人 `plugin install` 就能用
