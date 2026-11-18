import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const PORT = 3000;
const KAYIT_KLASORU = path.join(import.meta.dirname, 'belgeler');

await fs.mkdir(KAYIT_KLASORU, { recursive: true });

const sunucu = http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/style.css' || req.url === '/app.js')) {
    const dosyaAdi = req.url === '/' ? 'index.html' : req.url.slice(1);
    const uzanti = path.extname(dosyaAdi);
    const turler = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };

    try {
      const icerik = await fs.readFile(path.join(import.meta.dirname, dosyaAdi), 'utf8');
      res.writeHead(200, { 'Content-Type': `${turler[uzanti]}; charset=utf-8` });
      return res.end(icerik);
    } catch {
      res.writeHead(404);
      return res.end('Dosya bulunamadi');
    }
  }

  if (req.method === 'POST' && req.url === '/api/kaydet') {
    let govde = '';
    req.on('data', parca => { govde += parca; });
    req.on('end', async () => {
      try {
        const { baslik, icerik } = JSON.parse(govde);
        const guvenliAd = (baslik || 'isimsiz').replace(/[^a-z0-9_-]/gi, '_') + '.html';
        await fs.writeFile(path.join(KAYIT_KLASORU, guvenliAd), icerik, 'utf8');
        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ mesaj: 'Belge sunucuya kaydedildi!', dosya: guvenliAd }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ mesaj: 'Kayit hatasi olustu.' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Sayfa Bulunamadi');
});

sunucu.listen(PORT, () => {
  console.log(`Telifsiz Word sunucusu http://localhost:${PORT} adresinde calisiyor`);
});
