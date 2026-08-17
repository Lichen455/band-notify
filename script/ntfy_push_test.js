// ntfy 发送小工具（通用版，频道用占位符）
// 用法：node ntfy_push_test.js "标题" "正文" [优先级] [频道]
// 或环境变量：NTFY_TITLE / NTFY_BODY / NTFY_PRIORITY / NTFY_TOPIC
// 优先级：1最低 2低 3默认 4=high急促震动 5=urgent响铃
const https = require('https');

const title = process.env.NTFY_TITLE || process.argv[2] || '通知';
const message = process.env.NTFY_BODY || process.argv[3] || '测试消息';
const priority = Number(process.env.NTFY_PRIORITY || process.argv[4] || '3');
const topic = process.env.NTFY_TOPIC || process.argv[5] || '你的频道';

const payload = Buffer.from(message, 'utf8');
const req = https.request({
  hostname: 'ntfy.sh',
  path: '/' + topic + '?title=' + encodeURIComponent(title) + '&priority=' + priority,
  method: 'POST',
  rejectUnauthorized: false, // 需要完整证书校验时改为 true
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': payload.length,
  },
}, (res) => {
  let data = '';
  res.setEncoding('utf8');
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    console.log('HTTP ' + res.statusCode);
    try {
      const j = JSON.parse(data);
      console.log('id=' + j.id + '  title=' + j.title + '  priority=' + j.priority);
    } catch {}
  });
});

req.setTimeout(15000, () => {
  console.error('timeout');
  req.destroy();
});
req.on('error', (e) => console.error('ERR: ' + e.message));
req.write(payload);
req.end();
