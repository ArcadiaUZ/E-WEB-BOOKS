# Checkpoint — LUMEN elektron kutubxona

## Asosiy vazifa

Scroll boshqaruvli kinematik (frame-sequence) landing page + to'liq ishlaydigan elektron kutubxona:

- `video_for_interactive.mp4` (10 s, 1280×720, 24 fps) → WebP kadr sekvensiyasiga aylantirilgan va
  foydalanuvchi scroll progressiga bog'langan (avtoplay yo'q, scroll = virtual kamera).
- Sayt ichida: qidirish, kategoriya/sort filtrlari, Google orqali kirish, o'qish (matn + PDF),
  o'quvchi joyini saqlash.

## Hozirgi holat: ishlaydigan demo ✅

Barcha asosiy qismlar yozildi va smoke-test'dan o'tdi (jsdom harness, 24/24 PASS).

### Tuzilma

```
web_books/
├── index.html                    butun landing + library + reader + auth modal
├── assets/
│   ├── css/  base.css | cinematic.css | library.css | reader.css
│   ├── js/
│   │   ├── main.js               orchestrator (boot, rAF loop, wiring)
│   │   ├── config.js             googleClientId, frame/loader sozlamalari
│   │   ├── core/                 env.js (tier/reduced-motion) · ticker.js · dom.js · storage.js
│   │   ├── cinematic/            frameSource · frameLoader · sequencePlayer ·
│   │   │                         scrollController · choreography · particles
│   │   ├── ui/                   preloader · auth · library · reader
│   │   └── data/catalog.js       13 kitob (matn boblari + 1 PDF)
│   ├── frames/desktop|mobile|tiny|thumb/*.webp   (119 / 79 / 119 / 20 kadr)
│   ├── frames/poster.jpg         (1600×900, reduced-motion uchun)
│   ├── covers/*.svg              13 ta protsedura muqova (to'g'ri rang, premium qora)
│   └── books/Atomic_habits.pdf
├── vendor/pdfjs/                 pdf.min.mjs + pdf.worker.min.mjs (offline, CDN'siz)
└── tools/make-covers.mjs         katalogdan SVG muqovalarni generatsiya qiladi
```

### Kadr strategiyasi

| Set | Kadrlar | O'lcham | Vazifa |
|-----|---------|--------|--------|
| desktop | 119 | 1280×720, WebP q74 (5.2 MB) | desktop tier |
| mobile | 79 | 800×450, WebP q68 (2.1 MB) | ≤900px / coarse pointer / 2g |
| tiny | 119 | 32×18 | kelajakda blur-up placeholder |
| thumb | 20 | 480×270 | film-strip preview |

- Loader: `fetch` → `createImageBitmap` → LRU (`close()` bilan yopiladi), concurrency 6/4,
  radius 26/16, `keep` 46/26, `AbortController` bilan navbatni tozalash.
- Renders: bitta `<canvas>`, `requestAnimationFrame` + dt-based exponential damping
  (`k = 1 - e^(-9·dt)`) → sekin scroll, tez scroll va orqaga scroll bir xil silliq.
- Kadrlar tayyor bo'lmasa oxirgi kadr ushlab turiladi (flicker/bo'sahifa yo'q).
- Camera: progress bilan 1.035 → 1.135 sekin push-in + vertikal drift (Ken Burns effekti).

### Boshqa qismlar

- **Preloader**: inline progress bar + %, birinchi kadr tayyor bo'lishi bilan tugaydi
  (sahifani bloklamaydi), keyin `is-done` bilan opacity 0.
- **Choreography**: 5 ta beat, progress diapazoniga bog'langan (opacity/blur/scale/translate),
  HUD (kadr raqami, bob nomi, rail) va o'ngdagi vertikal progress rail.
- **Library**: 13 kitob, relevance/title/author/year/rating sort, `/` yoki `Cmd/Ctrl+K` qidiruv,
  IntersectionObserver bilan kartalar ko'rinishi.
- **Auth**: Google Identity Services (GIS) `googleClientId` bo'lsa rasmiy tugma; yo'q bo'lsa
  demo-kirish. Sessiya faqat localStorage'da.
- **Reader**: matn (boblar, shrift 18/20/23/26px, dark/sepia/light, progress saqlanadi) va
  PDF (pdf.js, 5 sahifalik render oyna, prev/next, keyboard ←/→/Esc).
- **Accessibility**: skip-link, focus trap modalda, aria-labels, `prefers-reduced-motion` →
  statik poster + normal layout, `hero.inert` faydalanuvchi chetlashganda.

## Tekshiruvlar (avto)

Harness: `/data/data/com.termux/files/usr/tmp/opencode/harness/smoke.mjs` (jsdom, lokal
`python3 -m http.server 8099`).

```
node smoke.mjs          → 24/24 PASS (0.25/0.5/1.0 progress, orqaga scroll, qidiruv,
                                    kategoriya, auth gate, reader, tez scroll, LRU)
MOBILE=1 node smoke.mjs → mobil kadrlar yuklanishi tekshiriladi
REDUCED=1 node smoke.mjs→ reduced-motion statik rejim
```

PDF tekshiruvi: `harness/pdfcheck.mjs` — 42 sahifa, matn chiqadi ✅ (jsdom'da canvas yo'q,
render faqat haqiqiy brauzerda tekshiriladi).

## Muhim topilgan va tuzatilgan muammolar

1. `frame_0120.webp` yashil (kodlash artefakti) → olib tashlandi, sequence 119 kadr.
2. `bridgeTop = Infinity` → `smoothstep` NaN berib, canvas butunlay ko'rinmas edi.
3. pdf.js import yo'li xato (`../../vendor` → `../../../vendor`).
4. `Atomic_habits.pdf` buzilgan/ed (xref, 256 sahifa claim, 5.1 MB) → Ghostscript bilan
   qayta yozildi → 42 sahifa, pdf.js to'liq o'qiydi (original `Atomic_habits.pdf` root'da saqlangan).
5. Muqovalarda hsl() renderer'larda qorayib ketardi → hex() ga o'tkazildi.

## Keyingi qadamlar

### 1. Haqiqiy brauzer testi (eng muhimi)
Termux'da brauzer yo'q; quyidagilarni real Chrome/Safari'da tekshirish kerak:

```bash
python3 -m http.server 8099     # ES modullar + fetch uchun HTTP kerak
# http://127.0.0.1:8099/
```

- [ ] Sekin / tez / orqaga scroll, takroriy scroll (jank, kadrlar "saltanishi")
- [ ] Touch scroll (iOS/Android), 390×844, 768×1024, 1920×1080
- [ ] Sekin tarmoq: preloader progress, kadrlar navbatga tushib turishi
- [ ] PDF sahifalar chizilishi va sahifa almashuvi (jsdom'da tekshirilmagan)
- [ ] Cover SVG'larining haqiqiy brauzerda ko'rinishi
- [ ] `prefers-reduced-motion` rejimi
- [ ] Klaviatura: Tab/Shift+Tab, `/`, ←/→, Esc

### 2. Google kirishni yoqish
`assets/js/config.js` → `googleClientId` ga OAuth 2.0 Web client ID (Google Cloud Console).
GIS skripti `index.html` da ulangan; origin'ni console'da ro'yxatdan o'tkazish shart.

### 3. Katalog kengaytirish
- `assets/js/data/catalog.js` ga yangi kitob qo'shish (id, cover, chapters).
- Yangi PDF qo'shishda `qpdf --check` yoki Ghostscript bilan tekshirish.

### 4. Yaxshilashlar (ixtiyoriy)
- Frame blur-up: `tiny` setni placeholder sifatida ishlatish (hozircha tayyor, ishlatilmayapti).
- Chapter/film-strip preview (`thumb` set) — cinematic boshlanishida.
- Reader uchun "oxirgi o'qigan sahifa" badge kitob kartasida.
- Lighthouse / performance profili o'lchovlari.

## Tez ishga tushirish

```bash
cd web_books
python3 -m http.server 8099
# brauzer: http://localhost:8099
```

Kadrlarni qayta chiqarish:

```bash
ffmpeg -i video_for_interactive.mp4 -an -vf "fps=12,scale=1280:720" -c:v libwebp -quality 74 assets/frames/desktop/frame_%04d.webp
ffmpeg -i video_for_interactive.mp4 -an -vf "fps=8,scale=800:450"  -c:v libwebp -quality 68 assets/frames/mobile/frame_%04d.webp
node tools/make-covers.mjs
```