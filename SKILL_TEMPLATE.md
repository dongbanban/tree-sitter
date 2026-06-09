---
name: tree-sitter
description: 当用户要求重构、分析、解释或检查某段特定的 JS/TS/JSX/TSX 函数、React 组件或 Hook 时，使用此技能进行精准代码切片。
---

# tree-sitter 精准代码切片器

作为 GitHub Copilot，当用户向你询问某个具体文件（支持 .js, .ts, .jsx, .tsx）中的具体组件、函数或方法时，你必须调用本技能来获取精准的上下文，禁止直接读取整个大文件。

## 🤖 你的操作指令

1. **识别参数：** 从用户的提问或当前活动的编辑器中，提取出：
   - `FILE_PATH`: 目标文件路径 (如 `./src/components/Header.tsx`)
   - `TARGET_NAME`: 组件名、函数名或方法名 (如 `Header` 或 `useAuth`)

2. **执行本地工具：**
   通过工作区终端静默运行全局或局部的命令（因为项目已经安装，直接通过 npx 调用）：
   ```bash
   npx tree-sitter-slice <FILE_PATH> <TARGET_NAME>
   ```
