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

// 确保文件上传目录存在
const uploadDir = path.join(__dirname, 'files');
fs.access(uploadDir).catch(() => fs.mkdir(uploadDir));

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

  const file = req.files.file;
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  try {
    await file.mv(filePath);
    res.json({ 
      fileName,
      url: `/files/${fileName}`,
      originalName: file.name
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});