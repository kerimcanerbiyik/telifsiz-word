const editor = document.querySelector('#editor');
const belgeBaslik = document.querySelector('#belgeBaslik');
const durumMesaji = document.querySelector('#durumMesaji');
const kelimeSayaci = document.querySelector('#kelimeSayaci');

window.addEventListener('DOMContentLoaded', () => {
  const kayitliIcerik = localStorage.getItem('acikword_icerik');
  const kayitliBaslik = localStorage.getItem('acikword_baslik');
  if (kayitliIcerik) editor.innerHTML = kayitliIcerik;
  if (kayitliBaslik) belgeBaslik.value = kayitliBaslik;
  sayaciGuncelle();
});

document.querySelectorAll('[data-komut]').forEach(buton => {
  buton.addEventListener('click', () => {
    const komut = buton.dataset.komut;
    document.execCommand(komut, false, null);
    editor.focus();
  });
});

document.querySelector('#yaziTipi').addEventListener('change', (e) => {
  document.execCommand('fontName', false, e.target.value);
});

document.querySelector('#yaziBoyutu').addEventListener('change', (e) => {
  document.execCommand('fontSize', false, e.target.value);
});

document.querySelector('#yaziRengi').addEventListener('input', (e) => {
  document.execCommand('foreColor', false, e.target.value);
});

editor.addEventListener('input', () => {
  localStorage.setItem('acikword_icerik', editor.innerHTML);
  durumMesaji.textContent = 'Tarayıcıya yedeklendi';
  sayaciGuncelle();
});

belgeBaslik.addEventListener('input', () => {
  localStorage.setItem('acikword_baslik', belgeBaslik.value);
});

function sayaciGuncelle() {
  const metin = editor.textContent.trim();
  const kelimeler = metin ? metin.split(/\s+/).length : 0;
  kelimeSayaci.textContent = `Kelime: ${kelimeler} | Karakter: ${metin.length}`;
}

document.querySelector('#btnSunucuKaydet').addEventListener('click', async () => {
  durumMesaji.textContent = 'Kaydediliyor...';
  try {
    const yanit = await fetch('/api/kaydet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baslik: belgeBaslik.value,
        icerik: editor.innerHTML
      })
    });
    const sonuc = await yanit.json();
    durumMesaji.textContent = `${sonuc.mesaj} (${sonuc.dosya})`;
  } catch {
    durumMesaji.textContent = 'Sunucuya bağlanılamadı (Yerel yedek aktif).';
  }
});

document.querySelector('#btnDocIndir').addEventListener('click', () => {
  const htmlSablon = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head><meta charset='utf-8'></head>
    <body>${editor.innerHTML}</body>
    </html>`;
  
  const dosya = new Blob(['\ufeff', htmlSablon], { type: 'application/msword' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dosya);
  link.download = `${belgeBaslik.value || 'belge'}.doc`;
  link.click();
});

document.querySelector('#btnYazdir').addEventListener('click', () => {
  window.print();
});
