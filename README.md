# Visual Insight V2 - Document to Visual SaaS Engine

> **Next-gen document visualization platform powered by MinerU VLM & Gemini 3 Pro.**

Visual Insight V2 是一款专为学术研究、技术报告及复杂文档设计的可视化解析工具。它通过深度集成 MinerU VLM 引擎精准提取文档内的原始图表与公式，并结合 Gemini 3 Pro 的高级推理能力，将枯燥的 PDF 瞬间转化为极具美感、现代化的 Linear 风格可视化网页。

---

## 🌟 核心特性 (Key Features)

- **🔍 精准图表提取 (MinerU Integration)**: 不同于传统的 OCR，集成 MinerU VLM 直接从 PDF 原始层中“抠出”科研图表、实验曲线和技术架构图。
- **🧠 智能布局重构 (Gemini 3 Pro)**: 利用大模型对论文内容进行深度语义理解，自动分配数据指标（Stats）、趋势图表（Charts）和图文矩阵（Gallery）。
- **🎨 Linear 设计美学 (Aesthetic Design)**: 采用极致简约的现代 UI，支持深色/浅色模式平滑切换，提供极致的阅读与展示体验。
- **🌐 全球化适配 (i18n & SaaS Ready)**: 完整支持中英双语切换，预留导出 PPT、分享链接等 SaaS 核心交互功能。
- **📈 动态可视化**: 自动将文中描述的实验数据转化为交互式 Recharts 图表。

---

## 🛠️ 技术架构 (Tech Stack)

| 模块 | 技术实现 |
| :--- | :--- |
| **前端框架** | React 19 (ES Modules) |
| **样式引擎** | TailwindCSS 3.0+ |
| **AI 引擎** | Google Gemini 3 Pro / 2.5 Flash |
| **文档解析** | MinerU VLM (OpenXLab API) |
| **数据可视化** | Recharts |
| **资源处理** | JSZip (用于 MinerU 结果包解压) |

---

## 🚀 快速开始 (Quick Start)

### 1. 环境准备
本项目采用现代前端开发模式（No-Build Step），直接通过 `index.html` 引入 ESM 模块。

### 2. API 配置
- **Gemini API**: 确保环境变量 `process.env.API_KEY` 已配置有效的 Google AI 密钥。
- **MinerU API**: 在 `services/mineruService.ts` 中配置 MinerU 的 Token。

### 3. 本地运行
推荐使用 VS Code 的 `Live Server` 扩展或 Python 简单服务器：
```bash
python -m http.server 8000
```
访问 `http://localhost:8000` 即可开始使用。

---

## 🗺️ 发展路线 (Roadmap)

我们正致力于将本项目打造成世界一流的出海 SaaS 工具：

- [ ] **AI 局部微调**: 点击任一区块即可通过对话让 AI 重写内容或更换图表形式。
- [ ] **PPTX 一键导出**: 使用 `pptxgenjs` 实现真正的演示文稿落地导出。
- [ ] **多模态音频叙事**: 集成 Gemini TTS，为解析生成的网页自动生成多语言语音解说。
- [ ] **协同编辑与分享**: 增加后端云存储支持，生成永久分享链接并追踪阅读数据。
- [ ] **风格模板库**: 提供 Academic, Startup, Dark-Tech 等多种行业模板。

---

## 📄 版权说明

© 2025 Visual Insight V2. Created by [Your Name/Company].
本项目基于 MIT 协议开源，部分解析能力由 MinerU 与 Google Gemini 提供支持。

---

## 💬 联系与反馈

如果您在出海 SaaS、AI 可视化或学术工具开发上有任何想法，欢迎通过 GitHub 或社交媒体联系我们。
