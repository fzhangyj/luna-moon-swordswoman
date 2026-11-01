# 露娜 · 月之剑士

原创二次元风格 3D 月之剑士，通过 Three.js 实时呈现。角色包含完整人物、五官、银色分束长发、月纹轻甲、分层裙摆、长靴、独立手指及长剑。本轮仅提供角色模型与观察界面。

## 运行

```powershell
npm install
npm run dev -- --port 5173
```

浏览器访问 http://localhost:5173/ 。手机与电脑连接同一局域网后，可以访问终端中显示的 Network 地址。

## 操作

- 鼠标拖动或单指拖动：旋转观察。
- 滚轮或双指手势：缩放。
- 全身、肖像、背面：切换取景。
- 自动旋转：开始或暂停环绕。
- 重置：回到全身正面并暂停自动旋转。
- 背景按钮：切换深色与浅色背景。
- 聚焦三维画面后，可用方向键调整视角。

## 文件

- `src/character.js`：全部角色几何与材质，无外部模型或贴图依赖。
- `src/main.js`：灯光、相机、轨道控制及界面行为。
- `src/style.css`：响应式展示界面。
- `artifacts/`：桌面、手机、肖像、背面截图及验证报告。
- `artifacts/luna.glb`：可导入 Blender、Godot 等工具的独立静态角色模型；运行 `npm run export:model` 可重新导出。
- 原有 `王者/` Godot 初始项目保留。

## 验证

```powershell
npm run build
npx playwright install chromium
npm run test:viewer
npm run test:short-screens
```

交互验证需要先启动开发服务器。测试检查真实 WebGL 输出、网格有效性、拖动旋转、滚轮缩放、三种镜头、自动旋转、重置、背景切换、手机布局和浏览器运行错误，并输出截图。

短屏验证覆盖 1280×720、320×568、390×844 与 1440×1000，检查完整人物投影位于控制栏上方，并验证手机肖像模式没有介绍文字覆盖面部。

如需使用本机已有 Chromium，可设置 `CHROMIUM_PATH` 环境变量。角色为静态展示模型，当前没有骨骼、战斗技能或训练场。
