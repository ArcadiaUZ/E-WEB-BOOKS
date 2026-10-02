# LUMEN — elektron kutubxona

Scroll boshqaruvli kinematik landing page va to'liq ishlaydigan onlayn kutubxona
(qidirish, Google orqali kirish, sayt ichida o'qish).

> Loyihaning to'liq holati, topshirilgan testlar va keyingi qadamlar →
> **[checkpoint.md](./checkpoint.md)**

## Ishga tushirish

ES modullar va `fetch` ishlatilgani uchun `file://` emas, HTTP server kerak:

```bash
python3 -m http.server 8099
# http://localhost:8099
```

Node 18+ bo'lsa: `npx serve .` yoki `npm i -g http-server && http-server -p 8099`.

## Nima qilingan

- **Kinematik scroll sahifasi.** 10 soniyalik videodan 119 ta WebP kadr ajratilgan va
  faylda `position: sticky` + rAF damping orqali foydalanuvchi scroll progressiga bog'lanadi —
  videotaglik autoplay ishlamaydi, g'ildirak virtual kamerani boshqaradi.
- **Ishlaydigan kutubxona.** 13 kitob, qidiruv (ism/muallif/mavzu), kategoriya va tartib
  filtrlari, `/` yoki `Cmd/Ctrl+K` qisqartiruvi.
- **O'qish.** Matn kitoblar (boblar, shrift/mavzu o'zgaruvchilari, progress saqlanadi) va
  PDF kitoblar (pdf.js, offline `vendor/pdfjs` orqali).
- **Kirish.** Google Identity Services (config'da `googleClientId` kerak) + demo rejim.

## Tuzilma

```
index.html
assets/css/          base · cinematic · library · reader
assets/js/core/      env (tier/reduced-motion) · ticker · dom · storage
assets/js/cinematic/ frameSource · frameLoader · sequencePlayer · scrollController ·
                     choreography · particles
assets/js/ui/        preloader · auth · library · reader
assets/js/data/      catalog.js
assets/frames/       desktop · mobile · tiny · thumb · poster
assets/covers/       generatsiya qilingan SVG muqovalar
vendor/pdfjs/        pdf.min.mjs · pdf.worker.min.mjs
tools/make-covers.mjs
```

## Kadrlarni qayta chiqarish

```bash
ffmpeg -i video_for_interactive.mp4 -an -vf "fps=12,scale=1280:720:flags=lanczos" \
  -c:v libwebp -quality 74 -compression_level 5 -preset picture assets/frames/desktop/frame_%04d.webp

ffmpeg -i video_for_interactive.mp4 -an -vf "fps=8,scale=800:450:flags=lanczos" \
  -c:v libwebp -quality 68 -compression_level 5 -preset picture assets/frames/mobile/frame_%04d.webp

node tools/make-covers.mjs
```

## Performance

- Kadrlar WebP, atrofga yaqin kadrlar lazy-load, `createImageBitmap` + LRU (`close()`),
  concurrency limit, `AbortController`, `requestIdleCallback` bilan fon zaxirasi.
- Mobil tier: pastroq o'lcham, kamroq kadr, boshqa parallelizm.
- `prefers-reduced-motion`: kinematik o'rniga statik poster, animatsiyalar o'chadi.

## Litsenziya

Kod: MIT. `assets/frames/*` — `video_for_interactive.mp4` dan generatsiya qilingan.
`assets/books/Atomic_habits.pdf` — James Clear, *Atomic Habits* (namuna).