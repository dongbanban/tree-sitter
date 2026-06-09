#!/usr/bin/env node

/**
 * @file: @dongbanban/tree-sitter/index.js
 * @author: dongbanban
 */

const fs = require("fs");
const path = require("path");
const { Parser, Language, Query } = require("web-tree-sitter");

async function main() {
  // 接收参数：tree-sitter-slice <文件路径> <函数或组件名>
  const [, , filePath, targetFuncName] = process.argv;

  if (!filePath || !targetFuncName) {
    console.error(
      "使用错误！格式应为: tree-sitter-slice <文件路径> <函数/组件/Hook名>",
    );
    process.exit(1);
  }

  // 1. 初始化 Tree-sitter
  await Parser.init();
  const parser = new Parser();

  // 2. 动态加载当前 npm 包自带的 tsx 语法包（通吃 js/ts/jsx/tsx）
  const wasmPath = path.join(__dirname, "parsers", "tree-sitter-tsx.wasm");
  if (!fs.existsSync(wasmPath)) {
    console.error(`Error: 找不到语法解析文件: ${wasmPath}`);
    process.exit(1);
  }
  const Lang = await Language.load(wasmPath);
  parser.setLanguage(Lang);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: 找不到目标代码文件: ${filePath}`);
    process.exit(1);
  }

  // 3. 读取并解析目标文件（Vue SFC 提取 script block）
  const rawCode = fs.readFileSync(filePath, "utf8");
  const ext = path.extname(filePath).toLowerCase();
  let sourceCode = rawCode;
  let scriptLineOffset = 0;
  if (ext === ".vue") {
    const scriptMatch = rawCode.match(
      /<script(?:[^>]*)>\n?((?:[\s\S]*?))<\/script>/,
    );
    if (!scriptMatch) {
      console.log(`--- [TREE-SITTER ERROR] ---`);
      console.log(`Vue 文件中未找到 <script> 块。`);
      console.log(`---------------------------`);
      process.exit(0);
    }
    scriptLineOffset = rawCode.slice(0, scriptMatch.index).split("\n").length;
    sourceCode = scriptMatch[1];
  }
  const tree = parser.parse(sourceCode);

  // 4. 定义可以匹配各种 JS/TS 声明（普通函数、箭头函数、类组件、自定义 Hook）的通用 Query
  const queryString = `
    [
      (function_declaration name: (identifier) @name)
      (variable_declarator name: (identifier) @name value: (arrow_function))
      (class_declaration name: (type_identifier) @name)
      (method_definition name: (property_identifier) @name)
    ]
  `;

  const query = new Query(Lang, queryString);
  const matches = query.matches(tree.rootNode);

  let foundNode = null;
  for (const match of matches) {
    const nameNode = match.captures.find((c) => c.name === "name")?.node;
    if (nameNode && nameNode.text === targetFuncName) {
      // 所有 pattern 的 @name capture 都是标识符节点，parent 才是完整声明节点
      foundNode = match.captures[0].node.parent;
      break;
    }
  }

  // 5. 格式化输出给 Copilot 读取
  if (foundNode) {
    console.log(`--- [TREE-SITTER SUCCESS] ---`);
    console.log(`目标名称: ${targetFuncName}`);
    const startLine = foundNode.startPosition.row + 1 + scriptLineOffset;
    const endLine = foundNode.endPosition.row + 1 + scriptLineOffset;
    console.log(`代码位置: L${startLine} - L${endLine}`);
    console.log(`\n${foundNode.text}\n`);
    console.log(`-----------------------------`);
  } else {
    console.log(`--- [TREE-SITTER ERROR] ---`);
    console.log(`在文件内未找到名为 [${targetFuncName}] 的函数、组件或方法。`);
    console.log(`---------------------------`);
  }
}

main().catch((err) => {
  console.error("运行时发生未知错误:", err);
  process.exit(1);
});
