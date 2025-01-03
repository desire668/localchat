const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = createServer(app);
const io = new Server(server);

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

const users = new Map();

io.on('connection', (socket) => {
  console.log('用户连接');

  socket.on('setUserInfo', (userInfo) => {
    users.set(socket.id, userInfo);
    io.emit('userList', Array.from(users.values()));
    socket.broadcast.emit('userJoined', userInfo);
  });

  socket.on('message', (message) => {
    const user = users.get(socket.id);
    io.emit('message', {
      ...message,
      user,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit('userLeft', user);
      users.delete(socket.id);
      io.emit('userList', Array.from(users.values()));
    }
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
  console.log(`Server running at http://localhost:${PORT}`);
});