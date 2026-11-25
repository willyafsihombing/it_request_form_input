// Ubah PNG/JPG/JPEG apa pun menjadi PNG kecil: garis hitam di atas latar transparan.
export async function fileToSignaturePng(
  file: File,
  maxW = 600,
  maxH = 200,
  threshold = 170, // 0-255; makin besar makin banyak piksel dianggap tinta
): Promise<string> {
  if (!/^image\/(png|jpe?g)$/.test(file.type)) {
    throw new Error('Hanya file PNG, JPG, atau JPEG.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File terlalu besar (maksimal 5 MB sebelum diperkecil).');
  }

  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bmp.width, maxH / bmp.height);
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();

  // Binarisasi: gelap -> tinta hitam, terang -> transparan.
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const ink = lum < threshold;
    d[i] = d[i + 1] = d[i + 2] = 0;
    d[i + 3] = ink ? 255 : 0;
  }
  ctx.putImageData(img, 0, 0);

  const url = canvas.toDataURL('image/png');
  if (url.length > 60000) {
    throw new Error('Gambar masih terlalu rumit. Gunakan foto tanda tangan di kertas putih dengan pena gelap.');
  }
  return url;
}