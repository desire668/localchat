export function generateRandomAvatar() {
  const seed = Math.random().toString(36).substring(7);
  const params = new URLSearchParams({
    seed,
    backgroundColor: 'b6e3f4,c0aede,d1d4f9',  // 随机背景色
    radius: '50',                              // 圆形
    scale: '80',                               // 大小比例
    flip: Math.random() > 0.5,                 // 随机翻转
  });
  
  // 使用 pixel-art 风格
  return `https://api.dicebear.com/7.x/pixel-art/svg?${params}`;
}