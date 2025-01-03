# 局域网聊天室

一个基于 React + Socket.IO 的实时聊天应用。

## 功能特性

- 实时消息通信
- 文件分享
- 用户头像支持
- 在线用户列表
- 系统通知（用户加入/离开）

## 运行步骤

1. 安装依赖：
```bash
npm install
```

2. 构建项目：
```bash
npm run build
```

3. 启动服务器：
```bash
npm run dev
```

4. 访问应用：
打开浏览器，访问 http://localhost:3000

## 注意事项

- 确保 Node.js 版本 >= 14
- 确保端口 3000 未被占用
- 如需修改端口，请同时修改 server.js 和 vite.config.js 中的端口配置 