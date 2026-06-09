/**
 * @file: /Users/i104/tree-sitter/install-skill.js
 * @author: dongbanban
 */

// install-skill.js
const fs = require("fs");
const path = require("path");

function init() {
  // 1. 获取当前脚本所在的绝对路径
  // 如果是被别人通过 npm install 安装，路径里必然包含 node_modules
  const isInstalled = __dirname.includes("node_modules");

  let projectRoot;

  if (isInstalled) {
    // 场景 A：被别人作为 npm 包安装
    // 此时它在别人的：主项目/node_modules/@dongbanban/tree-sitter/ 内部
    // 往上走 3 层（tree-sitter -> @dongbanban -> node_modules），完美到达主项目根目录
    projectRoot = path.resolve(__dirname, "..", "..", "..");
  } else {
    // 场景 B：你自己在本地的 /tree-sitter 目录下开发和测试
    // 此时 projectRoot 就是你当前仓库的根目录
    projectRoot = path.resolve(__dirname);
    console.log(
      "📦 [@dongbanban/tree-sitter] 检测到本地 /tree-sitter 开发模式，开始在本地生成测试 Skill...",
    );
  }

  // 2. 无论哪种场景，我们都去创建 .github/skills/tree-sitter/SKILL.md
  // 本地开发时，它会直接生成在你自己的 /tree-sitter/.github/... 下方便你检查效果
  const targetDir = path.join(projectRoot, ".github", "skills", "tree-sitter");
  const targetFile = path.join(targetDir, "SKILL.md");
  const templatePath = path.join(__dirname, "SKILL_TEMPLATE.md");

  try {
    // 递归创建多层级目录
    fs.mkdirSync(targetDir, { recursive: true });

    // 读取模板并写入目标位置
    const skillContent = fs.readFileSync(templatePath, "utf8");
    fs.writeFileSync(targetFile, skillContent, "utf8");

    if (isInstalled) {
      console.log("\n🚀 成功！已自动为您的项目配置 GitHub Copilot Skill。");
      console.log(`📂 已写入: .github/skills/tree-sitter/SKILL.md\n`);
    } else {
      console.log("✅ 本地测试 Skill 生成成功！");
      console.log(
        "📂 请查看当前目录下的: .github/skills/tree-sitter/SKILL.md\n",
      );
    }
  } catch (error) {
    console.warn("⚠️ 自动配置 Skill 失败:", error.message);
  }
}

init();
