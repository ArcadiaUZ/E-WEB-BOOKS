/**
 * Katalog — bitta manba (single source of truth).
 * `reader.kind` : 'pdf'  → pdf.js orqali ochiladi
 *                 'text' → bu fayldagi boblar (chapters) o'qiladi
 */

export const CATEGORIES = [
  { id: 'all', label: 'Barchasi' },
  { id: 'o\'zgarish', label: 'O\'zgarish' },
  { id: 'tarix', label: 'Tarix' },
  { id: 'klassika', label: 'Klassika' },
  { id: 'texnologiya', label: 'Texnologiya' },
  { id: 'falsafa', label: 'Falsafa' },
];

export const CATALOG = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    subtitle: '',
    author: 'James Clear',
    year: 2018,
    category: 'o\'zgarish',
    lang: 'en',
    pages: 320,
    rating: 4.8,
    tags: ['odatlar', 'disiplin', 'mahsuldorlik'],
    blurb:
      'Natija kunning oxirida emas, har kuni takrorlanadigan qadamlarda yashiriladi. Shu kitob kichik o\'zgarishlarning kattalikdagi ta\'sirini ko\'rsatadi.',
    reader: { kind: 'pdf', src: 'assets/books/Atomic_habits.pdf' },
  },
  {
    id: 'sapiens',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    year: 2011,
    category: 'tarix',
    lang: 'en',
    pages: 443,
    rating: 4.7,
    tags: ['tarix', 'inson', 'madaniyat'],
    blurb:
      'O\'z navbatida insoniyatni yuz ming yillik sayohat orqali ko\'rib chiqadi: paydo bo\'lish, dehqonlik, ilm-fan va kapitalizm.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Hominid imperiyasi',
          body:
            'At Taqaddodan o\'tgan million yillarda turli hominid turlari yerning ustida yashagan. Ularning ko\'pchisi cho\'qib ketdi. Biz esa — Homo sapiens — qoldiq yakka oilaviy chizig\'i bo\'lib qoldik.\n\nSapiens nomi lotincha "aql" degani, lekin aslida bizni ajratib turadigan narsa aql emas. Bu — til. Til orqali biz g\'ishtni yeyishni rejalashtirdik, kelajakni tasavvur qildik, o\'limdan qo\'rqib rivoyatlar yaratdik. Til — bu bir zumrda million yillik tajribani bir zumga sig\'dirish mexanizmi.\n\nSapiensning kuchli tomoni — ongning kutilmagan shekilli tarmoqlanishi. Har bir yangi ehtimol yangi imkoniyatlar tug\'iladi. Shu sababli biz texnologiyani, davlatni, dinni, kompaniyani ixtiro qildik — bularning barchasi o\'zaro bog\'liq hodisalar.',
        },
        {
          title: 'Dehqonlik inqilobi',
          body:
            'Agrar inqilob — insoniyat tarixidagi eng muhim voqea. U ovchilik va yig\'imchilikni tark etib, bir joyda yashashga imkon berdi. Natija: qishloqlar, shaharlar, davlatlar va dinlar.\n\nDehqonlik yerga nisbatan odam sonini ko\'paytirdi, lekin hayot sifatini har doim ham oshirmadi. Shaharlar qullik va epidemiyalarni ham ko\'paytirdi. Dunyo tarixi — bu yorug\'lik va zulm o\'rtasidagi doimiy muvofiqlik emas, balki ularning birga yashishi.\n\nAgrar inqilobdan keyin odamlar oshiga bog\'liq bo\'ldi: bug\'doy va arpa ekilmasa, ular och qolardi. Ehtimol shu sabab qishloq hayotida ko\'p o\'lim normal holatga aylangan.',
        },
        {
          title: 'Ilm-fan hamjamiyati',
          body:
            'Ilm-fan hamma narsani o\'lchash va takrorlash qobiliyatiga ega bo\'lgan paytdan boshlab yaxshi ishlaydi. Tabiiy hodisalarni tushunish uchun experiment, aniq natija uchun matematika kerak bo\'ldi.\n\nTarix o\'z navbatida tezlashdi: o\'tkazilgan bir kunlik hayot ko\'plab asrlarni qamrab oladi. Sabab — o\'zgarish darajasi emas, balki o\'zgarish tezligi.\n\nAmmo ilm-fan hamma narsani tushuntirmaydi. U aytadi: qanday ishlaydi. Qanday ma\'no beradi — bu savolga har doim alohida javob kerak.',
        },
      ],
    },
  },
  {
    id: 'ozbekiston-tarixi',
    title: "O'zbekiston Tarixi",
    subtitle: 'Mustaqillikka qadar',
    author: 'Tahrir: Sayidahmad Siddiqi',
    year: 2012,
    category: 'tarix',
    lang: 'uz',
    pages: 384,
    rating: 4.5,
    tags: ['tarix', 'madaniyat', 'movarounnahr'],
    blurb:
      'Temuriylar davridan to Sovet davriga qadar bo\'lgan O\'rta Osiyo tarixi, uning markaziy o\'rni va madaniy meros hujjatlari.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Ilk davlatlar',
          body:
            'Movarounnahr dastavlatlar tarixi dehqonlik bilan bog\'liq. Daryo vodiysida sug\'orish imkoniyati paydo bo\'lgach, aholi qishloqlarga ko\'chib joylashdi va ma\'muriy tashkilotlar vajudiyatga keldi.\n\nIlk yozuvlar orasida Buxoro, Samarqand va Xorazm o\'z nomini ko\'rsatgan holda mustaqil siyosiy yo\'nalishga ega bo\'lgan. Shaharlar nafaqat savdo markazi, balki ilm-fan, hunarmandchilik va adabiyot markazi ham bo\'lgan.\n\nQadimiy yozuvlarni o\'rganish — bu o\'tkazilmagan tarixni tiklashning eng ishonchli yo\'li.',
        },
        {
          title: 'Temuriylar davoni',
          body:
            'Temuriylar davrida Movarounnahr markazlashgan davlat yuzaga keldi. Poytaxt Samarqandga ko\'chdi, ilm-fan va san\'at gullab-parast bo\'ldi.\n\nUstavlarning mazmuni faqat harbiy emas, balki iqtisodiy, ma\'naviy va adabiy qoidalarni ham o\'z ichiga olgan. Nodirbek Ulug\'bekning yondashuvi — ilm-fanga nisbatan o\'tkazilgan yagona, o\'lchovga tayanadigan sinov.',
        },
        {
          title: 'Mustaqillikka yo\'l',
          body:
            'XX asr O\'rta Osiyoda katta siyosiy o\'zgarishlar davri bo\'ldi. Yosh mustaqil davlatlar o\'z ma\'muriy shaklini, ta\'lim tizimini va iqtisodiy yo\'nalishini qayta qurishga kirishdi.\n\nMerosiy boylik — ming yillik arxivlar, bitimlar va xotiralar — yangi davlat uchun eng qimmatli manba hisoblanadi.',
        },
      ],
    },
  },
  {
    id: 'kichik-prins',
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    year: 1943,
    category: 'klassika',
    lang: 'en',
    pages: 96,
    rating: 4.9,
    tags: ['klassika', 'h-cm', 'bolalar'],
    blurb:
      'Yulduzlar orasidagi sayohat — haqiqiy qimmat narsalar haqidagi eng qisqa va eng chuqur hikoya.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Birinchi uchrashuv',
          body:
            'Sahralada uchragan yolg\'iz aviator bolaga duch keladi. Bolaning yuziga hech qanday hovuch izi yo\'q — u qanday rasm chizishi haqida boshqacha tasavvur qilgan.\n\nDastavlat yozuvi juda sodda, lekin har bir jumlasi ikki marta o\'qilishi kerak: bir marta ko\'z bilan, bir marta yurak bilan.',
        },
        {
          title: 'Sayohat',
          body:
            'Prins o\'z yulduzidan uzoqlashadi va turli sayunatlarni ko\'radi. U yolg\'izlik, yoshiq narsalarga nisbatan ortiqcha qadrlash va vaqtni noto\'g\'ri o\'lchash haqida o\'ylaydi.\n\n"Meni eng ko\'p bezovta qiladigan narsa — odamlarning o\'zlarini boshqalarga solishtirishi," deydi u.',
        },
        {
          title: 'Qaytish',
          body:
            'Yulduzga qaytish — bu taslim emas, balki mas\'uliyat. Katta kattalik yoshaklikdagi sodda niyatga qaytishda namoyon bo\'ladi.',
        },
      ],
    },
  },
  {
    id: 'dune',
    title: 'Dune',
    subtitle: 'A Novel',
    author: 'Frank Herbert',
    year: 1965,
    category: 'klassika',
    lang: 'en',
    pages: 688,
    rating: 4.6,
    tags: ['fantastika', 'ekologiya', 'klassika'],
    blurb:
      'Qumli sayyorada hokimiyat, e\'tin va tabiat muvozanati haqidagi epik rom.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Qumdagi mas\'uliyat',
          body:
            'Desert — bu sayyorae\'tganing eng katta himoya quroli. Quyosh uning ustida ozgina qum ko\'taradi, qum esa uning quroli.\n\nYosh siyosatchi oilasi hokimiyatni mustahkamlash uchun behuda narx to\'lashga majbur. Sabri ham, ko\'rquv ham uning asosiy boyligi.',
        },
        {
          title: 'Yashirin til',
          body:
            'Kelajakda insoniyat kompyuterga emas, insoniyatning o\'ziga ishonadi. Boshqalar esa inson o\'ylashini to\'liq bashorat qila olmasligini biladi.',
        },
        {
          title: 'Muhit',
          body:
            'Romanda eng kuchli kuch — ekologik. Sahrolarni barbarlar deb o\'ylash noto\'g\'ri: bu — ular hayot manbai.',
        },
      ],
    },
  },
  {
    id: 'ming-toqqiz-yuz',
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    category: 'klassika',
    lang: 'en',
    pages: 328,
    rating: 4.7,
    tags: ['distopiya', 'klassika'],
    blurb:
      'Nazorat, xotira va til — inson ozodligini yo\'q qilishning uchta vositasi.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Jurnal',
          body:
            'Asosiy qahramon kundalik yozuv yuritadi. Bu uning kichik, lekin qat\'iy intilom hissi: shundaqa kun bo\'lishi kerak edi, deb u o\'ylaydi.\n\nNazorat o\'z kuchini tilga qaratadi. Eski lug\'atlarni almashtirish — fikrni emas, fikrni ifodalash mumkin bo\'lgan voqeani o\'zgartiradi.',
        },
        {
          title: 'Qarshi hujum',
          body:
            'Yozuvlar birdan o\'zgaradi: bir kun avval u hech qanday vazifaga ko\'ra kelmaganini yozgan edi, endi esa o\'ziga "vaqtni yo\'qotish" vazifasi beriladi. Xotira ham, uning aksi ham nazorat ostida.',
        },
      ],
    },
  },
  {
    id: 'ustoz-veli',
    title: 'The Master and Margarita',
    author: 'Mikhail Bulgakov',
    year: 1967,
    category: 'klassika',
    lang: 'en',
    pages: 480,
    rating: 4.8,
    tags: ['satira', 'klassika', 'fantastika'],
    blurb:
      'Sovyet Moskvasida hayot, adabiyot va axloq haqidagi aql bovar qilmas, Shotrakquy haqidagi hikoya.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Yo\'qlash',
          body:
            'Yozuvchi qarzga botib, qo\'shimchaga yashiriladi va qaror qabul qiladi: yozuvini yo\'qotadi. Xuddi shu kechasi uning oldida hokimiyat yuzasi chiqadi va Shotrakquy rubli vaqti kelishi haqida xabar beradi.',
        },
        {
          title: 'Rey',
          body:
            'Rey — she\'ron. U she\'riyatni yondashuv emas, kasallik darajasidagi aql hodisasi sifatida ko\'radi. Uning kelishi shaharni ham, kitobxonalarni ham buzadi.',
        },
        {
          title: 'Xulosa',
          body:
            'Niqoya yig\'iladi, lekin yig\'i orqali hech narsa tuzatilmaydi. Asarning xabari o\'shanday: adabiyot o\'z-o\'zidan jabrni zarbaga aylantirmaydi, faqat jarohatni ko\'rsatadi.',
        },
      ],
    },
  },
  {
    id: 'ikki-to-rt-qator',
    title: "Ikki To'rt Qator",
    subtitle: 'Roman',
    author: 'Xudoyberdi To\'xtaboyev',
    year: 1956,
    category: 'klassika',
    lang: 'uz',
    pages: 240,
    rating: 4.9,
    tags: ['o\'zbek klassikasi', 'roman'],
    blurb:
      'Qirillarning uzoq kechalari, tirik ruhaning qarshilanishi va yuzaga kelgan taqdir haqidagi roman.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Qahramonlik',
          body:
            'Yosh yozuvchi Qamola umum e\'tilmaydi. U o\'ziningi dur deb hisoblaydi, ammo hayot tez ochiladi: oilaviy vaziyat, ijtimoiy qarshilik va ichki tanqislik uni asta burib ketadi.',
        },
        {
          title: 'Yo\'li',
          body:
            'Yozuvchi o\'zgaradi, lekin nafaqat tashqi ta\'sir ostida — o\'z tanlagan yo\'l uni o\'zi ham tanlab oladi.',
        },
      ],
    },
  },
  {
    id: 'alximik',
    title: 'Alximik',
    subtitle: 'Roman',
    author: 'Oybek',
    year: 1945,
    category: 'klassika',
    lang: 'uz',
    pages: 288,
    rating: 4.7,
    tags: ['o\'zbek klassikasi', 'qishloq hayoti'],
    blurb:
      'Qishloq hayoti, tabiat va insan ichki dunyosining chuqur tasviri.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Tabiat',
          body:
            'Qishloq mehnati, suv va yerni olmosi kishi uchun ham ma\'naviy zaxira. Qahramon tabat bilan yagona bo\'lganda, uning hayotiga ziddiy kuchlar ham kamayadi.',
        },
        {
          title: 'Ichki dunyo',
          body:
            'Asarda voqealar sekin, lekin keskin o\'zgarishlar bilan boshqariladi. Taqiq va o\'lim qahramonni o\'ziga yaqinroq tortadi.',
        },
      ],
    },
  },
  {
    id: 'chuqur-ish',
    title: 'Deep Work',
    subtitle: 'Rules for Focused Success in a Distracted World',
    author: 'Cal Newport',
    year: 2016,
    category: 'o\'zgarish',
    lang: 'en',
    pages: 296,
    rating: 4.6,
    tags: ['fo\'a', 'ish usuli', 'texnologiya'],
    blurb:
      'Chuqur ish — bu e\'tiborni yo\'qotmasdan olib borish qobiliyati. Uni o\'rganish mumkin.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Chuqur ish',
          body:
            'Chuqur ish — bu ish sifati darajasini oshiradigan kasbiy faoliyat. Uni ko\'pchilik tavsiya qilinadi, chunki kam sonli odamlar uni muntazam ravishda qila oladi.\n\nKalit — chuqurlik shartini o\'z oldinga qo\'yish: muammoni real, yaxshi ta\'riflash mumkin bo\'lgan holga keltirish.',
        },
        {
          title: 'Ritual',
          body:
            'Diqqat uchun avval joy, vaqt va sharoit yaratish kerak. Chulg\'ining qiymati emas, qanchalik kam bo\'lishi muhim.',
        },
      ],
    },
  },
  {
    id: 'nosozchi-dasturchi',
    title: 'The Pragmatic Programmer',
    subtitle: 'Your Journey to Mastery',
    author: 'Andrew Hunt & David Thomas',
    year: 1999,
    category: 'texnologiya',
    lang: 'en',
    pages: 352,
    rating: 4.7,
    tags: ['dasturlash', 'arxitektura'],
    blurb:
      'Dasturchilik — san\'atdir: bilimni amaliyotga aylantirish, kodni va kasbiy hayotni uzoq muddatga cho\'ziladigan qilish.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Tuzoq',
          body:
            'O\'zgarishga qodir dastur — bu o\'z vaqtida o\'lchovchi va o\'zgarishni o\'zi uchun qulaylashtiruvchi dastur. Uni yozish esa — o\'z-o\'zidan kelgan texnik qarz.',
        },
        {
          title: 'Bilim',
          body:
            'Bilim qanchalik tez o\'zgarishni boshlasa, dastur shunchalik tez eskiradi. Shuning uchun ilg\'or til va kuchli vositalardan foydalanish tavsiya etiladi.',
        },
      ],
    },
  },
  {
    id: 'nol-bir',
    title: 'Zero to One',
    subtitle: 'Startups and the Future of Innovation',
    author: 'Peter Thiel',
    year: 2014,
    category: 'texnologiya',
    lang: 'en',
    pages: 208,
    rating: 4.4,
    tags: ['startup', 'innovatsiya', 'strategiya'],
    blurb:
      'Yaxshi biznes — raqibdan boshqa narsani qilishda. Zero dan birga o\'tish — yagona yo\'l.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Nol dan bir',
          body:
            'Barcha boshlangan nollar bilan tug\'iladi. Yangi mahsulot eskisini takrorlash emas — balki butunlay boshqa savolga javob berishdir.',
        },
        {
          title: 'Monopoliya',
          body:
            'Zo\'riqishni yo\'qotish, raqibni yo\'q qilish emas, balki mijoz uchun o\'rnini qattiqroq qilish bilan bog\'liq.',
        },
      ],
    },
  },
  {
    id: 'mashhur',
    title: 'Falsafa',
    subtitle: 'Mantiq va etika',
    author: 'Mantiq kafedrasi',
    year: 2019,
    category: 'falsafa',
    lang: 'uz',
    pages: 224,
    rating: 4.5,
    tags: ['falsafa', 'mantiq'],
    blurb:
      'Falsofa — dalil va tanqid. Savol qo\'yishni o\'rganish, tez va xato xulosalardan saqlanishning eng oddiy yo\'li.',
    reader: {
      kind: 'text',
      chapters: [
        {
          title: 'Dalil',
          body:
            'Dalil — xulosani asoslash jarayoni. U shaxsni ishontirish uchun emas, avvalo o\'zini tekshirish uchun zarur.',
        },
        {
          title: 'Etika',
          body:
            'Etika nima qilish kerakligini aytadi, lekin nima qilish yaxshi ekanini ham ko\'rsatishga uringadi.',
        },
      ],
    },
  },
];

export const findBook = (id) => CATALOG.find((b) => b.id === id);
