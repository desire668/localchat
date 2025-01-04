const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = createServer(app);

// 配置 Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"],
    credentials: false
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  cookie: false
});

// 开发环境下，将请求代理到 Vite 开发服务器
if (process.env.NODE_ENV === 'development') {
  const { createServer: createViteServer } = require('vite');
  createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  }).then(vite => {
    app.use(vite.middlewares);
  });
} else {
  // 生产环境使用构建后的文件
  app.use(express.static('dist'));
}

// 确保文件上传根目录存在
const uploadRootDir = path.join(__dirname, 'files');
fs.access(uploadRootDir).catch(() => fs.mkdir(uploadRootDir));

// 获取或创建日期文件夹
async function getDateFolder() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // 创建年份文件夹
  const yearDir = path.join(uploadRootDir, year.toString());
  await fs.access(yearDir).catch(() => fs.mkdir(yearDir));
  
  // 创建月份文件夹
  const monthDir = path.join(yearDir, month);
  await fs.access(monthDir).catch(() => fs.mkdir(monthDir));
  
  // 创建日期文件夹
  const dayDir = path.join(monthDir, day);
  await fs.access(dayDir).catch(() => fs.mkdir(dayDir));
  
  return {
    path: dayDir,
    relativePath: path.join(year.toString(), month, day)
  };
}

// 获取文件列表的接口
app.get('/files/list', async (req, res) => {
  try {
    const requestPath = req.query.path || '';
    const targetPath = path.join(uploadRootDir, requestPath);
    
    // 确保目标路径在 files 目录内
    if (!targetPath.startsWith(uploadRootDir)) {
      return res.status(403).send('访问被拒绝');
    }

    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
      const filePath = path.join(targetPath, entry.name);
      const stats = await fs.stat(filePath);
      return {
        name: entry.name,
        isDirectory: entry.isDirectory(),
        size: stats.size,
        modifiedTime: stats.mtime
      };
    }));

    // 排序：文件夹在前，文件在后，按名称排序
    files.sort((a, b) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name);
      }
      return b.isDirectory - a.isDirectory;
    });

    res.json({ files });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).send('获取文件列表失败');
  }
});

app.use('/files', express.static('files'));
app.use(fileUpload());

// 用户管理
const users = new Map();

// 连接处理
io.on('connection', (socket) => {
  console.log('新用户连接:', socket.id);

  // 设置用户信息
  socket.on('setUserInfo', (userInfo) => {
    try {
      console.log('设置用户信息:', socket.id, userInfo);
      
      // 存储用户信息
      const user = {
        id: socket.id,
        ...userInfo,
        lastActive: Date.now()
      };
      users.set(socket.id, user);

      // 广播用户列表更新
      const userList = Array.from(users.values());
      console.log('当前用户列表:', userList);
      io.emit('userList', userList);

      // 发送系统消息
      io.emit('message', {
        type: 'system',
        content: `${userInfo.nickname} 加入了聊天室`,
        timestamp: new Date().toISOString()
      });

      // 发送连接确认
      socket.emit('connected', { id: socket.id });
    } catch (error) {
      console.error('设置用户信息错误:', error);
    }
  });

  // 消息处理
  socket.on('message', (message) => {
    try {
      const user = users.get(socket.id);
      if (user) {
        user.lastActive = Date.now();
        console.log('收到消息:', socket.id, message);
        io.emit('message', {
          ...message,
          user: {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('发送消息错误:', error);
    }
  });

  // 心跳检测
  socket.on('ping', () => {
    try {
      const user = users.get(socket.id);
      if (user) {
        user.lastActive = Date.now();
        socket.emit('pong');
      }
    } catch (error) {
      console.error('心跳检测错误:', error);
    }
  });

  // 断开连接处理
  socket.on('disconnect', () => {
    try {
      const user = users.get(socket.id);
      if (user) {
        console.log('用户断开连接:', socket.id, user.nickname);
        
        // 发送离开消息
        io.emit('message', {
          type: 'system',
          content: `${user.nickname} 离开了聊天室`,
          timestamp: new Date().toISOString()
        });

        // 删除用户并更新列表
        users.delete(socket.id);
        io.emit('userList', Array.from(users.values()));
      }
    } catch (error) {
      console.error('断开连接错误:', error);
    }
  });

  // 错误处理
  socket.on('error', (error) => {
    console.error('Socket错误:', error);
  });
});

app.post('/upload', async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    const file = req.files.file;
    const dateFolder = await getDateFolder();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(dateFolder.path, fileName);
    
    await file.mv(filePath);
    res.json({ 
      fileName,
      url: `/files/${path.join(dateFolder.relativePath, fileName).replace(/\\/g, '/')}`,
      originalName: file.name
    });
  } catch (err) {
    console.error('文件上传错误:', err);
    res.status(500).send(err.message);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});