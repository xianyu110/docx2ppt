
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

## 🚀 部署指南 (Deployment)

### 部署到 Vercel (Recommended)

1. **连接 GitHub**: 将您的代码推送到 GitHub 仓库并连接到 Vercel。
2. **配置环境变量**: 在 Vercel 项目设置的 `Environment Variables` 中添加以下 Key：
   - `API_KEY`: 您的 Google Gemini API Key。
   - `MINERU_TOKEN`: 您的 MinerU API Token（可选，代码中已包含默认 Token）。
3. **构建设置**: 
   - **Framework Preset**: `Other` 或 `Static`。
   - **Root Directory**: `./`。
   - **Install Command**: `npm install` (如果存在 package.json)。
   - **Build Command**: 无需构建步骤。
4. **即刻上线**: 每次推送代码后，Vercel 将自动部署。

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

## 📄 版权说明

© 2025 Visual Insight V2. Created by [Your Name/Company].
本项目基于 MIT 协议开源，部分解析能力由 MinerU 与 Google Gemini 提供支持。
