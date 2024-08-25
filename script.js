const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');

const addNameButton = document.getElementById("addName");
const namesList = document.getElementById("namesList");

let names = [];
let arcSize;
let spinTimeout = null;
let startAngle = 0;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let colors = [];

const candyColors = [
  "#ff6663",
  "#feb144",
  "#fdfd97",
  "#9ee09e",
  "#9ec1cf",
  "#cc99c9",
  "#ff9aae",
  "#ffc1c1",
  "#f1a6a6",
  "#ffc600"
];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

layui.use(["layer"], function () {
  const layer = layui.layer;

  let isDrawing = false;

  const startButton = document.getElementById("start");

  function updateStartButtonState() {
    if (names.length === 0 || isDrawing) {
      startButton.setAttribute('disabled', 'disabled');
      startButton.classList.add('layui-btn-disabled'); // 添加禁用样式
    } else {
      startButton.removeAttribute('disabled');
      startButton.classList.remove('layui-btn-disabled'); // 移除禁用样式
    }
  }
  updateStartButtonState();

  const fileInput = document.getElementById("fileInput");
  const importNamesButton = document.getElementById("importNames");
  const addNameButton = document.getElementById("addName");

  // “增加参与者”按钮的点击事件
  addNameButton.addEventListener("click", () => {
    layer.prompt(
      {
        title: "请输入参与者姓名",
        formType: 0
      },
      function (name, index) {
        if (name && !names.includes(name)) {
          addParticipant(name);
          layer.close(index);
        }
      }
    );
    // 允许按下Enter键确认输入
    document
      .querySelector(".layui-layer-input")
      .addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          const name = event.target.value;
          if (name && !names.includes(name)) {
            addParticipant(name);
            layer.closeAll();
          }
        }
      });
  });

  // 使用标准的文件输入来处理文件读取
  importNamesButton.addEventListener("click", () => {
    fileInput.click(); // 触发文件选择
  });

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        const namesFromFile = content
          .split("\n")
          .map((name) => name.trim())
          .filter((name) => name.length > 0);
        namesFromFile.forEach((name) => {
          if (!names.includes(name)) {
            addParticipant(name);
          }
        });
      };
      reader.readAsText(file);
    }
    // 清空 fileInput 的值，以允许同一个文件被再次选择
    fileInput.value = '';
  });

  function addParticipant(name) {
    names.push(name);
    const availableColors = candyColors.filter(c => !colors.includes(c));
    const color = availableColors.length > 0 ? availableColors[Math.floor(Math.random() * availableColors.length)] : candyColors[Math.floor(Math.random() * candyColors.length)];
    colors.push(color);

    const listItem = document.createElement('div');
    listItem.className = 'name-item';

    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = color;

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;

    const editButton = document.createElement('button');
    editButton.className = 'layui-btn layui-btn-xs layui-btn-icon';
    editButton.setAttribute('data-tooltip', '编辑');
    editButton.innerHTML = '<i class="layui-icon layui-icon-edit"></i>';
    editButton.addEventListener('click', () => editName(names.indexOf(name)));

    const deleteButton = document.createElement('button');
    deleteButton.className = 'layui-btn layui-btn-xs layui-btn-icon';
    deleteButton.setAttribute('data-tooltip', '删除');
    deleteButton.innerHTML = '<i class="layui-icon layui-icon-delete"></i>';
    deleteButton.addEventListener('click', () => deleteName(names.indexOf(name)));

    listItem.appendChild(colorBox);
    listItem.appendChild(nameSpan);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    namesList.appendChild(listItem);
    drawRouletteWheel();
    updateStartButtonState();  // 更新按钮状态
  }

  function editName(indexString) {
    let index = parseInt(indexString)
    layer.prompt({
      title: '编辑名字',
      formType: 0,
      value: names[index]
    }, function (newName, promptIndex) {
      if (newName && !names.includes(newName)) {
        names[index] = newName;
        namesList.children[index].querySelector('span').textContent = newName;
        drawRouletteWheel();
        layer.close(promptIndex);
      }
    });

    // 允许使用 Enter 键确认编辑
    document.querySelector('.layui-layer-input').addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        layer.close(layer.index);
      }
    });
  }

  function deleteName(indexString) {
    let index = parseInt(indexString)
    names.splice(index, 1);
    colors.splice(index, 1);
    namesList.removeChild(namesList.children[index]);
    drawRouletteWheel();
    updateStartButtonState();  // 更新按钮状态
  }

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    drawRouletteWheel();
  });

  function drawRouletteWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (names.length === 0) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(centerX, centerY) - canvas.height * 0.1;
    const innerRadius = 0;

    for (let i = 0; i < names.length; i++) {
      arcSize = (Math.PI * 2) / names.length;
      const angle = startAngle + i * arcSize;
      ctx.fillStyle = colors[i];

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, angle, angle + arcSize, false);
      ctx.arc(centerX, centerY, innerRadius, angle + arcSize, angle, true);
      ctx.fill();
      ctx.save();

      // 逆时针旋转90度并保持2个字符的间距
      ctx.fillStyle = 'black';
      ctx.font = 'bold 30px sans-serif';
      ctx.translate(
        centerX + Math.cos(angle + arcSize / 2) * (outerRadius - 30),
        centerY + Math.sin(angle + arcSize / 2) * (outerRadius - 30));
      ctx.rotate(angle + arcSize / 2 + 2 * Math.PI);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(names[i], -ctx.measureText(names[i]).width / 2, 0);

      ctx.restore();

    }

    // 绘制中心红色圆圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, canvas.width * 0.018, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, canvas.width * 0.015, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY - outerRadius - 20);
    ctx.lineTo(centerX + 10, centerY - outerRadius - 20);
    ctx.lineTo(centerX, centerY - outerRadius + 10);
    ctx.fill();
  }

  function rotateWheel() {
    // 重新初始化旋转参数
    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 10000 + 2 * 10000;
    isDrawing = true;
    updateStartButtonState();
    rotate(); // 启动旋转
  }

  function rotate() {
    // 增加旋转时间
    spinTime += 30;

    // 如果旋转时间达到或超过总时间，停止旋转
    if (spinTime >= spinTimeTotal) {
      stopRotateWheel();
      return;
    }

    // 使用缓动函数计算当前的旋转角度
    const spinAngle =
      spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI) / 180;

    // 重新绘制转盘
    drawRouletteWheel();
    // 使用 requestAnimationFrame 替代 setTimeout 以获得更平滑的旋转效果
    requestAnimationFrame(rotate);
  }

  function stopRotateWheel() {
    // 旋转停止后的处理逻辑
    const degrees = (startAngle * 180) / Math.PI + 90;
    const arcd = (arcSize * 180) / Math.PI;
    const index = Math.floor((360 - (degrees % 360)) / arcd);

    ctx.save();

    layer.alert(`恭喜${names[index]}中奖！`, {
      icon: 6,
      title: '抽奖结果',
      shade: 0.5,
      btn: ['确定'],
      yes: function (index) {
        layer.close(index);
        isDrawing = false;
        updateStartButtonState();  // 抽奖结束后更新按钮状态
      }
    });

    showConfetti(); // 显示彩色纸片

    ctx.restore();
  }

  function easeOut(t, b, c, d) {
    // 缓动函数，使旋转逐渐减速
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
  }


  function showConfetti() {
    const confettiCount = 300;
    const confettiCanvas = document.getElementById('confettiCanvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    const centerX = confettiCanvas.width / 2;
    const centerY = confettiCanvas.height / 2;
    let confettiPieces = [];

    for (let i = 0; i < confettiCount; i++) {
      const angle = Math.random() * 2 * Math.PI; // 随机方向
      const speed = Math.random() * 15 + 2; // 随机速度
      confettiPieces.push({
        x: centerX,
        y: centerY,
        size: Math.random() * 15 + 5,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        angle: angle,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        gravity: 0.25 + Math.random() * 0.05, // 重力加速度
        opacity: 1,
        rotation: Math.random() * 360, // 随机初始旋转角度
        rotationSpeed: Math.random() * 10 - 5 // 随机旋转速度
      });
    }

    function drawConfetti() {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      confettiPieces.forEach((confetti) => {
        confetti.x += confetti.speedX;
        confetti.y += confetti.speedY;
        confetti.speedY += confetti.gravity; // 模拟重力
        confetti.size *= 0.98;  // 逐渐缩小
        confetti.opacity -= 0.01;  // 逐渐消失
        confetti.rotation += confetti.rotationSpeed; // 旋转

        if (confetti.size > 0 && confetti.opacity > 0) {
          confettiCtx.save();
          confettiCtx.globalAlpha = confetti.opacity;
          confettiCtx.translate(confetti.x, confetti.y);
          confettiCtx.rotate(confetti.rotation * Math.PI / 180);
          confettiCtx.fillStyle = confetti.color;
          confettiCtx.fillRect(-confetti.size / 2, -confetti.size / 2, confetti.size, confetti.size); // 绘制方形纸片
          confettiCtx.restore();
        }
      });

      confettiCtx.globalAlpha = 1; // 重置透明度

      confettiPieces = confettiPieces.filter(c => c.size > 0 && c.opacity > 0);

      if (confettiPieces.length > 0) {
        requestAnimationFrame(drawConfetti);
      }
    }

    drawConfetti();
  }

  // 为开始按钮绑定事件
  document.getElementById("start").addEventListener("click", rotateWheel);
});
