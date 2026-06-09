<!--
 * @file: /Users/i104/tree-sitter/README.md
 * @author: dongbanban
-->

# @dongbanban/tree-sitter

精准代码切片工具，支持 `.js` / `.ts` / `.jsx` / `.tsx` / `.vue`。

安装后自动注入 IDE Skill 路径下，Agent 即可通过 `npx tree-sitter-slice` 按需切片目标函数，避免读取整个大文件。

---

## 安装

```bash
npm i @dongbanban/tree-sitter -D
```

`postinstall` 钉子自动执行，将 Skill 写入项目的 `.agents/skills/tree-sitter/SKILL.md`。

---

## 使用

```bash
npx tree-sitter-slice <FILE_PATH> <SYMBOL_NAME>
```

| 参数          | 说明                                        |
| ------------- | ------------------------------------------- |
| `FILE_PATH`   | 目标文件路径，相对或绝对均可                |
| `SYMBOL_NAME` | 函数名、组件名、Hook 名或方法名（精确匹配） |

**示例：**

```bash
npx tree-sitter-slice src/utils/helpers.js formatDate
npx tree-sitter-slice src/components/Button.tsx Button
npx tree-sitter-slice src/hooks/useAuth.ts useAuth
npx tree-sitter-slice src/components/MyComp.vue MyComp
```

**输出格式：**

```
--- [TREE-SITTER SUCCESS] ---
目标名称: formatDate
代码位置: L12 - L24

function formatDate(value, format) {
  ...
}

-----------------------------
```

---

## 支持的声明类型

| 类型         | 示例                                                           |
| ------------ | -------------------------------------------------------------- |
| 普通函数     | `function foo() {}`                                            |
| 箭头函数变量 | `const foo = () => {}`                                         |
| 类           | `class Foo {}`                                                 |
| 类方法       | `class Foo { bar() {} }`                                       |
| Vue SFC      | `.vue` 文件内 `<script>` / `<script setup>` 中的任意函数或变量 |

---

## 工作原理

```
npm install
  └── postinstall → install-skill.js
        └── 写入 .agents/skills/tree-sitter/SKILL.md

npx tree-sitter-slice <file> <name>
  └── index.js
        ├── web-tree-sitter (Parser + Language + Query)
        ├── parsers/tree-sitter-tsx.wasm  ← 通吃 js/ts/jsx/tsx
        ├── .vue → 提取 <script> 块 → TSX parser（行号自动偏移）
        └── 输出匹配 symbol 的完整代码节点
```

`install-skill.js` 通过 `__dirname.includes('node_modules')` 判断运行场景：

- **被安装**：写入宿主项目根目录的 `.agents/skills/tree-sitter/SKILL.md`
- **本地开发**：写入自身仓库根目录，方便验证模板效果

---

## 依赖

- [`web-tree-sitter`](https://www.npmjs.com/package/web-tree-sitter) `^0.26.9`（具名导出 `Parser` / `Language` / `Query`）
- `parsers/tree-sitter-tsx.wasm`（来自 [tree-sitter-typescript](https://github.com/tree-sitter/tree-sitter-typescript) v0.23.2）
