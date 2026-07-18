/* ============================================================
   PICTURE PLACEHOLDERS

   These are simple drawings used as stand-ins for the image and
   video questions. They are NOT real photos or clips — they just
   show the "tell" (like a hand with six fingers).

   When you have real pictures or videos, put the files in the
   /assets/ folder and point a question at it in questions.json.
   You can leave this file alone unless you want to tweak a drawing.
   ============================================================ */

export const SVGS = {
  hand6: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#241F1A" stroke-width="3" stroke-linecap="round">
    <path d="M60 140V70" /><path d="M75 140V55" /><path d="M90 140V50" /><path d="M105 140V58" /><path d="M118 140V68" /><path d="M130 140V80" />
    <path d="M50 140h90a10 10 0 0010-10V120a10 10 0 00-10-10H50a10 10 0 00-10 10v10a10 10 0 0010 10z" fill="#e9dfc0"/>
  </g></svg>`,

  camera: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#241F1A" stroke-width="3">
    <rect x="24" y="52" width="112" height="76" rx="8" fill="#e9dfc0"/>
    <rect x="60" y="36" width="40" height="20" rx="3" fill="#e9dfc0"/>
    <circle cx="80" cy="90" r="26" fill="#ECE3C7"/>
    <circle cx="80" cy="90" r="14" fill="#c9bd94"/>
    <circle cx="118" cy="66" r="4" fill="#241F1A"/>
  </g></svg>`,

  videoBad: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#B23A2E" stroke-width="3">
    <rect x="20" y="30" width="120" height="90" rx="6" fill="#e9dfc0"/>
    <circle cx="80" cy="70" r="22" fill="#ECE3C7"/>
    <path d="M68 86q12 14 24 0" stroke-dasharray="3 4"/>
    <path d="M55 130l10-14M105 130l-10-14" stroke="#241F1A"/>
  </g></svg>`,

  videoGood: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#2F6F62" stroke-width="3">
    <rect x="20" y="30" width="120" height="90" rx="6" fill="#e9dfc0"/>
    <circle cx="80" cy="70" r="22" fill="#ECE3C7"/>
    <path d="M68 82q12 10 24 0"/>
    <path d="M55 130l10-14M105 130l-10-14" stroke="#241F1A"/>
  </g></svg>`,

  /* ---- IMAGE placeholders ---- */

  // Portrait with mismatched/asymmetric earrings — a common AI tell.
  earringsAsym: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#241F1A" stroke-width="3">
    <circle cx="80" cy="70" r="34" fill="#ECE3C7"/>
    <path d="M60 66q6 -8 12 0M88 66q6 -8 12 0"/>
    <path d="M70 88q10 8 20 0"/>
    <circle cx="46" cy="86" r="5" fill="#B8912E" stroke="#B8912E"/>
    <rect x="110" y="80" width="8" height="14" rx="2" fill="#B8912E" stroke="#B8912E"/>
    <path d="M40 120q40 -26 80 0" fill="#e9dfc0"/>
  </g></svg>`,

  // Eyeglasses whose frame dissolves on one side — AI melt.
  glassesMelt: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#B23A2E" stroke-width="3">
    <circle cx="58" cy="80" r="20" fill="#ECE3C7"/>
    <circle cx="104" cy="80" r="20" fill="#ECE3C7"/>
    <path d="M78 80h8"/>
    <path d="M38 80q-10 2 -14 10" />
    <path d="M124 80q10 6 6 20" stroke-dasharray="3 5"/>
  </g></svg>`,

  // Plate of food with an extra fork prong / warped cutlery.
  foodPlate: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#241F1A" stroke-width="3">
    <circle cx="80" cy="84" r="40" fill="#ECE3C7"/>
    <circle cx="80" cy="84" r="26" fill="#e9dfc0"/>
    <path d="M30 60v20M34 60v20M38 60v20M42 60v18M30 80q6 6 12 0v34"/>
    <path d="M124 60v40M124 100v14"/>
  </g></svg>`,

  // Landscape photo — clean, believable (human).
  landscape: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#241F1A" stroke-width="3">
    <rect x="24" y="40" width="112" height="80" rx="4" fill="#dce7dc"/>
    <path d="M24 96l30 -26 22 18 20 -22 40 30" fill="#c9bd94"/>
    <circle cx="112" cy="62" r="10" fill="#ECE3C7"/>
  </g></svg>`,

  // Text/sign in an image with garbled letters — AI tell.
  garbledSign: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#B23A2E" stroke-width="3">
    <rect x="30" y="50" width="100" height="60" rx="4" fill="#e9dfc0"/>
    <path d="M44 72h8l-4 10M60 72q6 0 6 6t-6 6M78 72v16M90 74l8 12M108 72q-6 8 0 16"/>
  </g></svg>`,

  // Architecture photo, straight lines (human).
  building: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#241F1A" stroke-width="3">
    <rect x="46" y="36" width="68" height="88" fill="#e9dfc0"/>
    <path d="M58 50h14v14h-14zM88 50h14v14h-14zM58 78h14v14h-14zM88 78h14v14h-14z"/>
    <path d="M70 104h20v20h-20z" fill="#c9bd94"/>
  </g></svg>`,

  /* ---- VIDEO placeholders ---- */

  // Hands that flicker between frames — AI video tell.
  videoHands: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#B23A2E" stroke-width="3">
    <rect x="20" y="30" width="120" height="90" rx="6" fill="#e9dfc0"/>
    <path d="M64 96V72M74 96V64M84 96V62M94 96V70" />
    <path d="M58 96h44v10H58z" fill="#ECE3C7"/>
    <path d="M108 60l8 8M116 60l-8 8" />
  </g></svg>`,

  // Smooth interview clip — natural (human).
  videoInterview: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#2F6F62" stroke-width="3">
    <rect x="20" y="30" width="120" height="90" rx="6" fill="#e9dfc0"/>
    <circle cx="80" cy="66" r="18" fill="#ECE3C7"/>
    <path d="M52 120q28 -30 56 0" fill="#ECE3C7"/>
    <rect x="66" y="128" width="28" height="6" rx="3" fill="#c9bd94"/>
  </g></svg>`,

  // Background warps / morphs behind subject — AI tell.
  videoWarpBg: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#B23A2E" stroke-width="3">
    <rect x="20" y="30" width="120" height="90" rx="6" fill="#e9dfc0"/>
    <path d="M30 50q20 -12 40 0t40 0" stroke-dasharray="4 4"/>
    <path d="M30 100q20 12 40 0t40 0" stroke-dasharray="4 4"/>
    <circle cx="80" cy="74" r="16" fill="#ECE3C7"/>
  </g></svg>`,

  // Handheld street clip, natural shake (human).
  videoStreet: `<svg viewBox="0 0 160 160"><g fill="none" stroke="#2F6F62" stroke-width="3">
    <rect x="20" y="30" width="120" height="90" rx="6" fill="#e9dfc0"/>
    <path d="M40 110l24 -40 20 24 16 -20 20 36" fill="#c9bd94"/>
    <circle cx="108" cy="56" r="8" fill="#ECE3C7"/>
  </g></svg>`
};
