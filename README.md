# 局域网聊天室

一个基于现代 Web 技术栈构建的实时聊天应用，支持局域网内的即时通讯、文件共享和表情发送。

## 技术栈

### 前端
- React 18
- Tailwind CSS
- Socket.IO Client
- Emoji Picker Element
- Vite 构建工具

### 后端
- Node.js (v18+)
- Express.js
- Socket.IO
- express-fileupload

### 桌面应用
- Electron
- electron-builder

## 功能特性

- 实时消息通信
- 文件上传和分享
  - 图片自动预览
  - 按日期自动归类存储
  - 支持多种文件类型
- 用户系统
  - 自定义昵称
  - 头像支持
  - 在线状态显示
- 界面
  - 深色/浅色主题切换
  - 响应式设计
  - 表情选择器
  - 消息时间戳
- 系统通知
  - 用户加入/离开提醒
  - 文件上传状态

## 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Windows/macOS/Linux

## 开发环境设置

1. 克隆项目：
```bash
git clone [项目地址]
cd localchat
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 启动 Electron 开发模式：
```bash
npm run electron
```

## 生产环境构建

1. 构建 Web 应用：
```bash
npm run build
```

2. 打包桌面应用：
```bash
npm run package
```

## 项目结构

```
localchat/
├── src/                    # 源代码目录
│   ├── components/        # React 组件
│   ├── utils/            # 工具函数
│   ├── App.jsx           # 主应用组件
│   └── main.jsx          # 入口文件
├── electron/              # Electron 相关文件
├── public/               # 静态资源
├── files/                # 上传文件存储目录
│   └── YYYY/MM/DD/      # 按日期组织的文件
├── server.js             # Express 服务器
├── vite.config.js        # Vite 配置
└── package.json          # 项目配置文件
```

## 配置说明

### 端口配置
默认端口为 3000，可以通过以下方式修改：
1. 开发环境：修改 `server.js` 中的 `PORT` 常量
2. 生产环境：在应用配置界面中设置

### 文件上传
- 上传目录：`files/`
- 文件按日期自动归类：`YYYY/MM/DD/`
- 支持的图片格式：jpg、jpeg、png、gif、webp、bmp

## 注意事项

1. 确保端口未被占用
2. 局域网使用时需要关闭防火墙或开放相应端口
3. 文件上传大小限制：默认 50MB
4. 建议定期清理文件目录

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 发起 Pull Request

## 作者

- desire
- QQ: 2082216455
- GitHub: https://github.com/desire668

## 许可证

MIT License 