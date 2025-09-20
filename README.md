## AiKrai's Blog

基于 Astro 的个人博客，已做中文化与博客常用功能增强：标签、分类、归档、目录、RSS、站点地图、代码高亮与明暗主题等。样式简陋复刻了 Chirpy 主题。

- 在线地址: https://blog.aikrai.com
- 技术栈: Astro 5、MD/MDX、astro-expressive-code、Shiki、PNPM

## 功能特性

- 标签与分类：支持 `/tags`、`/tags/[tag]`、`/categories`、`/categories/[category]`
- 文章归档：按年份归档 `/archives`
- RSS 订阅：`/rss.xml`，站点地图：`/sitemap-index.xml`
- MD/MDX 写作，自动生成目录（TOC）
- 代码高亮：GitHub Light/Dark 主题，暗黑模式自适应
- 中文界面 + 左侧侧边栏 + 置顶顶部栏
- 特殊字符标签安全链接：`CI/CD`、`C++` 等可正常作为标签使用

## 目录结构

```text
├── public/                # 静态资源（原样拷贝）
├── src/
│   ├── components/        # 组件（侧边栏、顶部栏、目录等）
│   ├── content/           # 内容（Markdown/MDX）
│   │   └── blog/          # 博文目录
│   ├── layouts/           # 页面与文章布局
│   ├── pages/             # 路由页面
│   ├── styles/            # 全局样式与变量
│   └── utils/             # 工具（标签安全编码等）
├── astro.config.mjs       # Astro 配置（站点域名、集成等）
├── src/content.config.ts  # 内容集合与 Frontmatter 校验
├── src/consts.ts          # 站点标题、作者、社交链接、导航
├── package.json
└── tsconfig.json
```

## 本地开发

前置要求：Node.js 18+，建议使用 PNPM。

```bash
pnpm install
pnpm dev        # 本地开发，默认 4321 端口
pnpm build      # 生产构建到 dist/
pnpm preview    # 预览生产构建
```

## 写作指南（Markdown/MDX）

- 在 `src/content/blog/` 下新建 `.md` 或 `.mdx` 文件。
- Frontmatter 字段由 `src/content.config.ts` 校验：

```yaml
---
title: "文章标题"
description: "一段简短摘要"
pubDate: 2024-06-18         # 推荐 ISO 格式，字符串会被自动解析为日期
updatedDate: 2024-06-19     # 可选
heroImage: "./cover.png"    # 可选，使用相对路径引用同目录图片
tags: ["CI/CD", "Android"] # 可选
categories: ["DevOps"]     # 可选
author: "AiKrai"            # 可选
pin: false                  # 可选
math: false                 # 可选
mermaid: false              # 可选
---

正文支持 Markdown 与 MDX。
```

说明：
- 标签/分类可包含特殊字符（如 `CI/CD`），系统会自动进行安全编码并生成正确链接。
- 封面图 `heroImage` 使用 Astro 内容图片类型（`image()`），建议将图片与文章放在同一目录，用相对路径引用。
- 文章会在首页按 `pubDate` 倒序展示；右侧自动渲染「目录」。

## 路由一览

- `/` 首页：最新文章列表
- `/blog/[...slug]` 文章详情
- `/tags` 标签云；`/tags/[tag]` 指定标签文章列表
- `/categories` 分类页；`/categories/[category]` 指定分类文章列表
- `/archives` 归档页（按年份）
- `/about` 关于页
- `/rss.xml` RSS 订阅；`/sitemap-index.xml` 站点地图

## 配置与定制

- 站点信息：`src/consts.ts`（站点标题、作者、社交链接、导航等）
- 站点域名：`astro.config.mjs` 的 `site` 字段（用于生成绝对链接、RSS、Sitemap）
- 主题/样式：`src/styles/variables.css` 与 `src/styles/global.css`
- 代码高亮：`astro-expressive-code` 已配置 GitHub Light/Dark 主题
- 明暗主题：`components/ThemeScript.astro` 读取 `localStorage.theme` 初始化 `data-theme`

## 部署

该站点为静态产物，构建后输出到 `dist/`，可部署到任意静态托管：
- Nginx/Apache/静态对象存储
- GitHub Pages / Cloudflare Pages / Vercel 等

Nginx 示例（根路径部署）：

```nginx
location / {
  root   /var/www/blog/dist;
  index  index.html;
  try_files $uri $uri/ /index.html;
}
```

