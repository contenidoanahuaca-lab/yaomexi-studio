const fs = require('fs');
const { execSync } = require('child_process');

const [,, prompt='Hola TikTok', duration='5'] = process.argv;

fs.mkdirSync('output', { recursive: true });
const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const safeText = String(prompt).replace(/'/g, "\\'").replace(/:/g, '\\:');

const withText = `
ffmpeg -y -f lavfi -i color=c=#111111:s=720x1280:d=${duration} \
  -vf "drawtext=fontfile=${font}:text='${safeText}':fontcolor=white:fontsize=52:box=1:boxcolor=#00000099:x=(w-text_w)/2:y=(h-text_h)/2" \
  -c:v libx264 -pix_fmt yuv420p output/tiktok.mp4
`.trim();

const fallback = `
ffmpeg -y -f lavfi -i color=c=#111111:s=720x1280:d=${duration} \
  -c:v libx264 -pix_fmt yuv420p output/tiktok.mp4
`.trim();

try {
  console.log('▶️ FFmpeg con drawtext…');
  execSync(withText, { stdio: 'inherit' });
  console.log('✅ Generado con drawtext: output/tiktok.mp4');
} catch (e) {
  console.warn('⚠️ drawtext falló, usando fallback sin texto:', e.message);
  execSync(fallback, { stdio: 'inherit' });
  console.log('✅ Generado fallback: output/tiktok.mp4');
}
