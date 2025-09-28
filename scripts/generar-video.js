const fs = require('fs');
const { execSync } = require('child_process');

const [,, prompt='Hola TikTok', duration='5'] = process.argv;

// Asegurar carpeta de salida
fs.mkdirSync('output', { recursive: true });

// Fuente disponible en ubuntu-latest
const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

// Escapar comillas simples y dos puntos para FFmpeg/drawtext
const safeText = String(prompt).replace(/'/g, "\\'").replace(/:/g, '\\:');

// Comando: fondo 720x1280, texto centrado, caja semitransparente
const cmd = `
ffmpeg -y -f lavfi -i color=c=#111111:s=720x1280:d=${duration} \
  -vf "drawtext=fontfile=${font}:text='${safeText}':fontcolor=white:fontsize=52:box=1:boxcolor=#00000099:x=(w-text_w)/2:y=(h-text_h)/2" \
  -c:v libx264 -pix_fmt yuv420p output/tiktok.mp4
`.trim();

console.log('▶️ Ejecutando FFmpeg...');
execSync(cmd, { stdio: 'inherit' });
console.log('✅ Listo: output/tiktok.mp4');
