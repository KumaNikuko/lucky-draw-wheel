const starCanvas = document.getElementById('starCanvas');
const starCtx = starCanvas.getContext('2d');

function resizeCanvas() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  drawStars();
}

function drawStars() {
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  const numberOfStars = 250; // 设置星星数量
  for (let i = 0; i < numberOfStars; i++) {
    // console.log("draw Star:",i);
    const x = Math.random() * starCanvas.width;
    const y = Math.random() * starCanvas.height;
    const radius = Math.random() * 2; // 随机星星的大小
    starCtx.beginPath();
    starCtx.arc(x, y, radius, 0, Math.PI * 2);
    starCtx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`; // 随机亮度
    starCtx.fill();
  }
}

// 窗口大小调整时重新绘制星空背景
window.addEventListener('resize', resizeCanvas);
resizeCanvas();