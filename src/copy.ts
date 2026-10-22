// Every learner string, in English and Malay (D4, D34).
export type Lang = "en" | "ms";

const enWords = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];
const msWords = [
  "tiada",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "lapan",
  "sembilan",
  "sepuluh",
];

const word = (words: string[], n: number) => words[n] ?? String(n);
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// The Arabic and its reading in Latin letters, shared by both languages. The doa carry harakat; the names do not.
export const arabic = {
  hajarAswad: "الحجر الأسود",
  maqamIbrahim: "مقام إبراهيم",
  istilam: {
    doa: "بِسْمِ اللهِ وَاللهُ أَكْبَرُ",
    reading: "Bismillāhi wallāhu akbar",
  },
  rabbana: {
    doa: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    reading:
      "Rabbanā ātinā fid-dunyā ḥasanah, wa fil-ākhirati ḥasanah, wa qinā ʿadhāban-nār",
  },
};
const istilamWords = arabic.istilam.reading;

export type Copy = (typeof copy)[Lang];

export const copy = {
  en: {
    appName: "VirtualHajj",
    tawaf: "Tawaf",
    loading: "Loading the Kaabah…",
    viewerSay: "Drag to look round the Kaabah.",
    viewerLabel:
      "3D view of the Kaabah. Drag, or use the arrow keys, to turn it.",
    viewerTouch: "Pinch to zoom in and out.",
    viewerMouse:
      "Scroll to zoom. With the keyboard, the arrow keys turn the view and + and − zoom.",
    startTawaf: "Start tawaf",
    language: "Language",
    noWebgl: "This browser can't show the 3D view.",
    noWebglNext: "Open this link in an up-to-date Chrome or Safari.",
    stopped: "The 3D view stopped.",
    stoppedNext: "Reload the page to start it again.",
    reload: "Reload",

    hints: "Hints",
    on: "On",
    off: "Off",
    menu: "Menu",
    closeMenu: "Close menu",
    paused: "Paused",
    carryOn: "Carry on",
    startAgain: "Start tawaf again",
    backToViewer: "Back to the Kaabah view",

    walkTouch: "Tap the floor to walk",
    walkMouse: "Walk with the arrow keys, or click the floor",
    lineName: "Hajar Aswad line",
    turnToLine: "Turn to the Hajar Aswad line",
    sceneLabel:
      "3D view of the mataf. Your pilgrim walks round the Kaabah. Tap or click the floor, or use the arrow keys, to walk.",

    beforeLead: "Before you start",
    beforeSay: "Walk to the Hajar Aswad line.",
    beforeBody: "Your first round starts there. Keep the Kaabah on your left.",
    roundOf: (n: number) => `Round ${n} of 7`,
    roundSay: "Keep the Kaabah on your left.",
    roundBody: (n: number) =>
      n < 7
        ? `Round ${n + 1} starts at the Hajar Aswad line, glowing ahead.`
        : "Your tawaf ends at the Hajar Aswad line, glowing ahead.",

    notCounted: "This round does not count",
    wrongWaySay: "Turn round, so the Kaabah is on your left.",
    hijrSay: "Walk outside the Hijr Ismail wall.",
    wrongWayWhy: "Tawaf goes anticlockwise.",
    hijrWhy: "The Hijr Ismail is part of the Kaabah.",
    restartBody: (n: number | null) =>
      n === null
        ? "Walk on to the Hajar Aswad line, and the round starts again there."
        : `Walk on to the Hajar Aswad line, and round ${n} starts again there.`,

    done: "Done",
    notDoneLead: "Not done yet",
    shortSay: (n: number) =>
      n === 0
        ? "No round counts yet. Tawaf has seven."
        : `${capital(word(enWords, n))} round${n === 1 ? "" : "s"} count${n === 1 ? "s" : ""}. Tawaf has seven.`,
    shortBody: (n: number) =>
      `Walk ${word(enWords, 7 - n)} more round${7 - n === 1 ? "" : "s"}, then press Done.`,

    doneTitle: "Tawaf done. Seven rounds.",
    noMistakes: "No mistakes on the way.",
    onTheWay: "On the way",
    walkAgain: "Walk again",
    listWrongWay: (n: number) =>
      `Round ${n}: you walked with the Kaabah on your right.`,
    listHijr: (n: number) => `Round ${n}: you walked inside the Hijr Ismail.`,
    listEarly: (n: number) =>
      n === 0
        ? "You pressed Done before a round counted."
        : `You pressed Done after ${word(enWords, n)} round${n === 1 ? "" : "s"}.`,
    listOver: (n: number) =>
      `You walked ${word(enWords, n)} rounds. Tawaf has seven.`,

    stationStart: "Station · Start of tawaf",
    stationAfter: "Station · After tawaf",
    istilamTitle: "The Hajar Aswad line",
    istilamBody:
      "Every round starts and ends here. Face the Hajar Aswad, raise your right hand towards it, and say:",
    istilamMeaning: "In the name of Allah, and Allah is the Greatest.",
    istilamThen: "Then turn so the Kaabah is on your left, and start round 1.",
    startRound1: "Start round 1",
    showMeHow: "Show me how",
    istilamSay: "Raise your right hand to the Hajar Aswad.",
    istilamNote: `Say “${istilamWords}”. Then walk on, with the Kaabah on your left.`,
    doaSay: "Say this doa as you walk.",
    rabbanaMeaning:
      "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",

    roundsDone: "Seven rounds done",
    toMaqamSay: "Walk to the glowing spot behind the Maqam Ibrahim.",
    toMaqamLineNote: `First raise your right hand to the Hajar Aswad, and say “${istilamWords}”.`,
    toMaqamNote: "Pray two rakaat there, facing the Kaabah.",
    maqamName: "Maqam Ibrahim",
    turnToMaqam: "Turn to the Maqam Ibrahim",
    sevenCount: "Seven rounds count.",
    finishTawaf: "Finish tawaf",
    rakaatTitle: "Two rakaat behind the Maqam Ibrahim",
    rakaatBody:
      "Face the Kaabah, with the Maqam Ibrahim in front of you, and pray two rakaat.",
    rakaatFirst: "In the first rakaat, read al-Kafirun after al-Fatihah.",
    rakaatSecond: "In the second rakaat, read al-Ikhlas after al-Fatihah.",
    rakaatCrowd:
      "When the crowd is too dense here, you may pray anywhere in the Masjidil Haram.",
    noRakaat:
      "You did not pray the two rakaat behind the Maqam Ibrahim. They are sunnah, so your tawaf still counts.",
  },
  ms: {
    appName: "VirtualHajj",
    tawaf: "Tawaf",
    loading: "Memuatkan Kaabah…",
    viewerSay: "Seret untuk melihat sekeliling Kaabah.",
    viewerLabel:
      "Paparan 3D Kaabah. Seret, atau guna kekunci anak panah, untuk memusingkannya.",
    viewerTouch: "Cubit untuk zum masuk dan keluar.",
    viewerMouse:
      "Tatal untuk zum. Dengan papan kekunci, kekunci anak panah memusingkan pandangan, dan + serta − untuk zum.",
    startTawaf: "Mula tawaf",
    language: "Bahasa",
    noWebgl: "Pelayar ini tidak dapat menunjukkan paparan 3D.",
    noWebglNext: "Buka pautan ini dalam Chrome atau Safari yang terkini.",
    stopped: "Paparan 3D terhenti.",
    stoppedNext: "Muat semula halaman untuk memulakannya semula.",
    reload: "Muat semula",

    hints: "Petunjuk",
    on: "Hidup",
    off: "Mati",
    menu: "Menu",
    closeMenu: "Tutup menu",
    paused: "Dijeda",
    carryOn: "Teruskan",
    startAgain: "Mula tawaf semula",
    backToViewer: "Kembali ke paparan Kaabah",

    walkTouch: "Ketik lantai untuk berjalan",
    walkMouse: "Berjalan dengan kekunci anak panah, atau klik lantai",
    lineName: "Garisan Hajar Aswad",
    turnToLine: "Pusing ke garisan Hajar Aswad",
    sceneLabel:
      "Paparan 3D mataf. Jemaah anda berjalan mengelilingi Kaabah. Ketik atau klik lantai, atau guna kekunci anak panah, untuk berjalan.",

    beforeLead: "Sebelum mula",
    beforeSay: "Berjalan ke garisan Hajar Aswad.",
    beforeBody:
      "Pusingan pertama anda bermula di situ. Pastikan Kaabah di sebelah kiri anda.",
    roundOf: (n: number) => `Pusingan ${n} daripada 7`,
    roundSay: "Pastikan Kaabah di sebelah kiri anda.",
    roundBody: (n: number) =>
      n < 7
        ? `Pusingan ${n + 1} bermula di garisan Hajar Aswad yang bercahaya di hadapan.`
        : "Tawaf anda tamat di garisan Hajar Aswad yang bercahaya di hadapan.",

    notCounted: "Pusingan ini tidak dikira",
    wrongWaySay: "Pusing balik, supaya Kaabah di sebelah kiri anda.",
    hijrSay: "Berjalan di luar tembok Hijir Ismail.",
    wrongWayWhy: "Tawaf mengikut arah lawan jam.",
    hijrWhy: "Hijir Ismail ialah sebahagian daripada Kaabah.",
    restartBody: (n: number | null) =>
      n === null
        ? "Teruskan ke garisan Hajar Aswad, dan pusingan itu bermula semula di situ."
        : `Teruskan ke garisan Hajar Aswad, dan pusingan ${n} bermula semula di situ.`,

    done: "Selesai",
    notDoneLead: "Belum selesai",
    shortSay: (n: number) =>
      n === 0
        ? "Belum ada pusingan yang dikira. Tawaf ada tujuh."
        : `${capital(word(msWords, n))} pusingan dikira. Tawaf ada tujuh.`,
    shortBody: (n: number) =>
      `Jalan ${word(msWords, 7 - n)} pusingan lagi, kemudian tekan Selesai.`,

    doneTitle: "Tawaf selesai. Tujuh pusingan.",
    noMistakes: "Tiada kesilapan sepanjang tawaf.",
    onTheWay: "Sepanjang tawaf",
    walkAgain: "Tawaf semula",
    listWrongWay: (n: number) =>
      `Pusingan ${n}: anda berjalan dengan Kaabah di sebelah kanan.`,
    listHijr: (n: number) =>
      `Pusingan ${n}: anda berjalan di dalam Hijir Ismail.`,
    listEarly: (n: number) =>
      n === 0
        ? "Anda menekan Selesai sebelum satu pusingan pun dikira."
        : `Anda menekan Selesai selepas ${word(msWords, n)} pusingan.`,
    listOver: (n: number) =>
      `Anda berjalan ${word(msWords, n)} pusingan. Tawaf ada tujuh.`,

    stationStart: "Stesen · Permulaan tawaf",
    stationAfter: "Stesen · Selepas tawaf",
    istilamTitle: "Garisan Hajar Aswad",
    istilamBody:
      "Setiap pusingan bermula dan tamat di sini. Hadap Hajar Aswad, angkat tangan kanan ke arahnya, dan sebut:",
    istilamMeaning: "Dengan nama Allah, dan Allah Maha Besar.",
    istilamThen:
      "Kemudian pusing supaya Kaabah di sebelah kiri anda, dan mulakan pusingan 1.",
    startRound1: "Mula pusingan 1",
    showMeHow: "Tunjukkan cara",
    istilamSay: "Angkat tangan kanan ke arah Hajar Aswad.",
    istilamNote: `Sebut “${istilamWords}”. Kemudian teruskan, dengan Kaabah di sebelah kiri anda.`,
    doaSay: "Baca doa ini sambil berjalan.",
    rabbanaMeaning:
      "Wahai Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami daripada azab neraka.",

    roundsDone: "Tujuh pusingan selesai",
    toMaqamSay: "Berjalan ke tempat yang bercahaya di belakang Maqam Ibrahim.",
    toMaqamLineNote: `Mula-mula angkat tangan kanan ke arah Hajar Aswad, dan sebut “${istilamWords}”.`,
    toMaqamNote: "Solat dua rakaat di situ, menghadap Kaabah.",
    maqamName: "Maqam Ibrahim",
    turnToMaqam: "Pusing ke Maqam Ibrahim",
    sevenCount: "Tujuh pusingan dikira.",
    finishTawaf: "Tamatkan tawaf",
    rakaatTitle: "Dua rakaat di belakang Maqam Ibrahim",
    rakaatBody:
      "Hadap Kaabah, dengan Maqam Ibrahim di hadapan anda, dan solat dua rakaat.",
    rakaatFirst:
      "Dalam rakaat pertama, baca surah al-Kafirun selepas al-Fatihah.",
    rakaatSecond:
      "Dalam rakaat kedua, baca surah al-Ikhlas selepas al-Fatihah.",
    rakaatCrowd:
      "Jika terlalu sesak di sini, anda boleh solat di mana-mana dalam Masjidil Haram.",
    noRakaat:
      "Anda tidak solat dua rakaat di belakang Maqam Ibrahim. Ia sunat, jadi tawaf anda tetap sah.",
  },
};
