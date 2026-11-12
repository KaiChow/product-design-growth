# Product Design Daily — 90 次产品 / UX / UI 学习 Skill

**这是可直接安装的 Agent Skill**，不是单个长提示词。支持兼容 Agent Skills 标准的 AI 代理；在支持 Node.js 和本地文件读写的代理里可以持久化进度。

## 它包含什么

- 72 节循序渐进的独立知识课：产品 24、UX 交互 24、UI 视觉 24。
- 12 次周复盘、5 次综合设计任务、1 次结业综合评估，总共 90 次。
- 课程生成标准、权威来源分级、练习评分标准、到期复习机制。
- 纯 Node.js 的真实进度管理（无需 npm install）。

## 安装

从压缩包解压出 `product-design-daily/` 整个文件夹，保留目录层级。

**Codex（跨项目个人使用）**：将文件夹放到 `~/.agents/skills/product-design-daily/`。Windows 例子：`C:\Users\你的用户名\.agents\skills\product-design-daily\SKILL.md`。这是当前 Codex 官方文档推荐的用户技能目录；项目内安装则放在 `<仓库>/.agents/skills/product-design-daily/`。

在 Codex 输入：`$product-design-daily 今天开始学习`。

**支持 Agent Skills 的其他环境**：按对应产品的技能目录规则放置文件夹；不要仅复制 `SKILL.md`，因为课程与脚本在其他目录中。

## 本地试运行（需要 Node.js 18+）

进入技能文件夹后运行：

```bash
node scripts/validate.mjs
node scripts/daily.mjs today
node scripts/daily.mjs status
```

`today` 会记录今天展示的是哪一课，并输出结构化 JSON 供 AI 生成中文课程。它不会自己输出完整讲义——**讲义是 AI 依据 Skill 和课程数据生成的**。重复运行当日 `today`，不会意外进入下一课。

你答完课堂练习后，AI 才评估并记录：

```bash
node scripts/daily.mjs answer --score 3 --note "能解释主要取舍，但遗漏失败后的恢复路径"
```

主动进入下一课（仅在你明确要求时）：

```bash
node scripts/daily.mjs advance
```

复习与进度：

```bash
node scripts/daily.mjs review --topic P01 --score 4 --note "能独立应用到新场景"
node scripts/daily.mjs status
```

## 记录位置与迁移

默认储存在 `~/.product-design-daily/progress.json`，Windows 是 `%USERPROFILE%\.product-design-daily\progress.json`。压缩包内不包含私人学习记录；安装升级和解压都不会覆盖它。

你也可以通过环境变量 `PDD_STATE_DIR` 指定独立目录；可备份该目录迁移到另一台设备。**同一份 Skill 目录并不等于多设备进度自动同步**。

如果 AI 环境没有终端或文件读写能力，Skill 仍可授课，但无法保证跨对话真实进度；在这种模式下需要手动告诉它“上次 Day NN”，不能声称会自动保存。

## 命令和时间规则

| 命令 | 行为 |
|---|---|
| `today` | 当天第一次展示下一课、同日重现最后一课、跨日期逐课推进 |
| `advance` | 显式提前进入下一课，可同日多次运行 |
| `status` | 查看当前已展示、已评估、平均分、待复习情况 |
| `answer --score 0..4 [--topic P01]` | 默认记录最新练习，也可指定此前课程补答 |
| `review --topic P01 --score 0..4` | 记录复习表现并刷新间隔 |
| `validate.mjs` | 检查课程完整性、编号、三领域均衡 |

为便于自动化测试，`today`、`advance`、`answer`、`review` 支持 `--date YYYY-MM-DD`，正式使用时可省略。若检测到日期回退，脚本不会倒退进度。

## 质量边界

- 正式标准、启发式、平台指导与一般设计建议分别呈现。
- 不自动给没做的练习打分。
- 不因用户只调用一次就承诺自动每日定时运行；若需要固定时间提醒，要在外部接入调度器。
- 90 次完成是第一轮学习成果，不代表获得设计专家资格。

## 文件结构

```text
product-design-daily/
├─ SKILL.md
├─ README.md
├─ agents/openai.yaml
├─ data/curriculum.json
├─ references/
│  ├─ curriculum-guide.md
│  ├─ teaching-standard.md
│  ├─ source-policy.md
│  └─ assessment.md
├─ scripts/
│  ├─ daily.mjs
│  └─ validate.mjs
├─ examples/day-01-sample.md
└─ tests/daily.test.mjs
```

Skill 格式参考：https://agentskills.io/specification
Codex 安装指南：https://learn.chatgpt.com/docs/build-skills
