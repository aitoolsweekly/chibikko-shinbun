const SURNAMES = [
  "田中", "鈴木", "佐藤", "高橋", "渡辺", "伊藤", "山本", "中村", "小林", "加藤",
  "吉田", "山田", "佐々木", "山口", "松本", "井上", "木村", "林", "斎藤", "清水",
  "山崎", "森", "池田", "橋本", "阿部", "石川", "前田", "藤田", "後藤", "岡田",
];

const FIRST_NAMES = [
  "さくら", "はな", "ゆい", "みく", "あおい", "ひまり", "ことね", "りん", "なな", "もも",
  "たろう", "けんと", "はると", "ゆうと", "りょう", "そうた", "れん", "しょう", "かいと", "こうき",
];

function getDailyItems(date: Date) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const i1 = seed % SURNAMES.length;
  const i2 = (seed * 7 + 3) % SURNAMES.length;
  const i3 = (seed * 13 + 5) % FIRST_NAMES.length;
  const i4 = (seed * 17 + 11) % FIRST_NAMES.length;
  const i5 = (seed * 31) % FIRST_NAMES.length;
  return {
    nichoku1: SURNAMES[i1],
    nichoku2: SURNAMES[i2 === i1 ? (i2 + 1) % SURNAMES.length : i2],
    doodleName1: FIRST_NAMES[i3],
    doodleName2: FIRST_NAMES[i4 === i3 ? (i4 + 1) % FIRST_NAMES.length : i4],
    heartName: FIRST_NAMES[i5],
  };
}

const toFull = (n: number) =>
  n.toString().split("").map(c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)).join("");

export default function Blackboard({ backLink }: { backLink?: boolean }) {
  const now = new Date();
  const { nichoku1, nichoku2 } = getDailyItems(now);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const month = toFull(now.getMonth() + 1);
  const day = toFull(now.getDate());
  const weekday = weekdays[now.getDay()];

  const chalkFill = "rgba(255,255,255,0.90)";
  const dimFill = "rgba(255,255,255,0.45)";
  const font = "'Klee One', serif";

  return (
    <header>
      <svg
        viewBox="0 0 800 96"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
        overflow="hidden"
      >
        <defs>
          <filter id="chalk" x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="board-tex" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="turbulence" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix"
              values="0 0 0 0 0.1  0 0 0 0 0.27  0 0 0 0 0.09  0 0 0 0.15 0"
              in="noise" result="tinted" />
            <feBlend in="SourceGraphic" in2="tinted" mode="multiply" />
          </filter>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a4317" />
            <stop offset="50%" stopColor="#2a6324" />
            <stop offset="100%" stopColor="#1e4a1b" />
          </linearGradient>
          <clipPath id="board-clip">
            <rect x="0" y="0" width="800" height="96" />
          </clipPath>
        </defs>

        {/* 背景 */}
        <rect width="800" height="96" fill="url(#bg)" filter="url(#board-tex)" />

        {/* 枠線 */}
        <rect x="5" y="4" width="790" height="88" fill="none"
          stroke="rgba(255,255,255,0.16)" strokeWidth="1.2" />

        {/* 上下チョーク破線 */}
        <line x1="14" y1="12" x2="786" y2="12"
          stroke="white" strokeOpacity="0.2" strokeWidth="0.8" strokeDasharray="18 10" />
        <line x1="14" y1="84" x2="786" y2="84"
          stroke="white" strokeOpacity="0.16" strokeWidth="0.8" strokeDasharray="12 8" />

        <g clipPath="url(#board-clip)">
          {/* もどるリンク */}
          {backLink && (
            <a href="/">
              <text x="18" y="24" fontSize="11" fill="rgba(255,255,255,0.65)"
                fontFamily={font} filter="url(#chalk)">← もどる</text>
            </a>
          )}

          {/* ===== 中央：タイトル ===== */}
          <text
            x="400" y="55"
            fontFamily={font}
            fontSize="42"
            fontWeight="600"
            fill={chalkFill}
            letterSpacing="8"
            textAnchor="middle"
            filter="url(#chalk)"
            transform="rotate(-0.5,400,55)"
          >
            ちびっこ新聞
          </text>

          {/* キャッチフレーズ */}
          <text
            x="400" y="78"
            fontFamily={font}
            fontSize="11"
            fill={dimFill}
            letterSpacing="2"
            textAnchor="middle"
            filter="url(#chalk)"
          >
            5歳がわかる、今日のニュース。
          </text>

          {/* ===== 右下：黒板消し（青ケース＋白布） ===== */}
          {/* 青いケース本体 */}
          <rect x="628" y="74" width="46" height="12" rx="2" fill="#3a6db5" />
          {/* ケースのハイライト */}
          <rect x="628" y="74" width="46" height="4" rx="2" fill="#5088d0" opacity="0.6" />
          {/* 白い布（フェルト面） */}
          <rect x="626" y="83" width="50" height="7" rx="1" fill="#f0eeea" />
          {/* 布の質感ライン */}
          <line x1="630" y1="85" x2="670" y2="85" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
          <line x1="630" y1="87" x2="670" y2="87" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
          {/* チョーク汚れ（白布の上） */}
          <line x1="633" y1="85" x2="641" y2="85" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="647" y1="86" x2="655" y2="86" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="658" y1="84" x2="664" y2="84" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" strokeLinecap="round" />
          {/* チョークの粉 */}
          <circle cx="623" cy="87" r="1.5" fill="rgba(255,255,255,0.3)" />
          <circle cx="618" cy="84" r="1" fill="rgba(255,255,255,0.22)" />
          <circle cx="621" cy="91" r="1.2" fill="rgba(255,255,255,0.2)" />

          {/* ===== 右：日付（縦・単独列）／日直＋名前（左隣・下寄り） ===== */}

          {/* 日付：右端の列、上から下まで */}
          <text
            x="778" y="11"
            fontFamily={font}
            fontSize="9"
            fill={chalkFill}
            letterSpacing="1.5"
            writingMode="vertical-rl"
            filter="url(#chalk)"
          >
            {month}月{day}日（{weekday}）
          </text>

          {/* 日直ラベル：日付の左隣・下寄り */}
          <text
            x="757" y="52"
            fontFamily={font}
            fontSize="8"
            fill={chalkFill}
            letterSpacing="3"
            writingMode="vertical-rl"
            filter="url(#chalk)"
          >
            日直
          </text>

          {/* 名前1（縦・日直の左） */}
          <text
            x="736" y="48"
            fontFamily={font}
            fontSize="12"
            fill={chalkFill}
            letterSpacing="2"
            writingMode="vertical-rl"
            filter="url(#chalk)"
          >
            {nichoku1}
          </text>

          {/* 名前2（縦・さらに左） */}
          <text
            x="715" y="48"
            fontFamily={font}
            fontSize="12"
            fill={chalkFill}
            letterSpacing="2"
            writingMode="vertical-rl"
            filter="url(#chalk)"
          >
            {nichoku2}
          </text>
        </g>
      </svg>
    </header>
  );
}
