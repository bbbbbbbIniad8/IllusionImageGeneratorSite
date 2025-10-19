const content = document.getElementById('content')
const button = document.getElementById('download');

function createStripCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < height; y++) {
    ctx.fillStyle = (y % 2 !== 0) ? 'black' : 'white';
    ctx.fillRect(0, y, width, 1);
  }
  return canvas;
}

function create4K(originalImage){
    const canvas = document.createElement('canvas');
    const newWidth = 4000;
    const newHeight = Number((newWidth/originalImage.width) * originalImage.height);
    canvas.width = newWidth;
    canvas.height = newHeight
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);

    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i+1] + data[i+2]) / 3;
        data[i] = 127;
        data[i+1] = 127;
        data[i+2] = 127;
        data[i+3] = 255 - gray;
    }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function createIllusionImage(imagePath) {
  const originalImage = await loadImage(imagePath);

  const processedCanvas = create4K(originalImage);
  const { width, height } = processedCanvas;

  const stripCanvas = createStripCanvas(width, height);

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = width;
  finalCanvas.height = height;
  const finalCtx = finalCanvas.getContext('2d');

  finalCtx.fillStyle = 'white';
  finalCtx.fillRect(0, 0, width, height);

  finalCtx.drawImage(stripCanvas, 0, 0);
  finalCtx.drawImage(processedCanvas, 0, 0);

  return finalCanvas;
}

document.getElementById('uploader').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);
  const resultCanvas = await createIllusionImage(imageUrl);
  resultCanvas.id = 'result';
  const last = content.lastElementChild;
  button.style.display = '';

  if (content.children.length >= 5) {
    content.removeChild(last)
  }
  content.appendChild(resultCanvas);
};

button.addEventListener('click', () => {
  const canvas = document.getElementById('result');
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'canvas-image.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
