'use client';

import { CatalogItem } from '../lib/demo';

/**
 * Deterministic reference artwork for a medicine: the glyph follows the
 * dosage form and the palette is stable per molecule, so the same medicine
 * always renders the same image without any stored assets.
 */

const PALETTE_HUES = [145, 200, 260, 20, 340, 175, 225, 45];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function paletteFor(item: CatalogItem): { bg: string; accent: string; accent2: string; soft: string } {
  const h = PALETTE_HUES[hashString(item.moleculeInn + item.dosageForm) % PALETTE_HUES.length];
  return {
    bg: `hsl(${h} 70% 93%)`,
    accent: `hsl(${h} 58% 42%)`,
    accent2: `hsl(${h} 55% 58%)`,
    soft: `hsl(${h} 60% 80%)`,
  };
}

function Glyph({ form, c }: { form: string; c: { accent: string; accent2: string; soft: string } }) {
  switch (form) {
    case 'tablet':
      return (
        <g>
          <circle cx="100" cy="100" r="46" fill={c.accent2} />
          <circle cx="100" cy="100" r="46" fill="none" stroke={c.accent} strokeWidth="5" />
          <ellipse cx="84" cy="82" rx="18" ry="10" fill="#ffffff" opacity="0.35" transform="rotate(-30 84 82)" />
          <line x1="66" y1="100" x2="134" y2="100" stroke={c.accent} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case 'capsule':
      return (
        <g transform="rotate(-32 100 100)">
          <path d="M 55 78 A 22 22 0 0 1 100 78 L 100 122 A 22 22 0 0 1 55 122 Z" fill={c.accent2} />
          <path d="M 145 78 A 22 22 0 0 0 100 78 L 100 122 A 22 22 0 0 0 145 122 Z" fill={c.soft} />
          <rect x="55" y="78" width="90" height="44" rx="22" fill="none" stroke={c.accent} strokeWidth="5" />
          <ellipse cx="72" cy="88" rx="10" ry="5" fill="#ffffff" opacity="0.4" />
        </g>
      );
    case 'syrup':
      return (
        <g>
          <rect x="83" y="38" width="34" height="18" rx="5" fill={c.accent} />
          <rect x="89" y="54" width="22" height="12" fill={c.soft} />
          <rect x="62" y="66" width="76" height="96" rx="14" fill={c.accent2} stroke={c.accent} strokeWidth="4" />
          <rect x="62" y="106" width="76" height="56" rx="14" fill={c.accent} opacity="0.55" />
          <rect x="72" y="76" width="10" height="72" rx="5" fill="#ffffff" opacity="0.4" />
        </g>
      );
    case 'injection':
      return (
        <g transform="rotate(-40 100 100)">
          <rect x="52" y="88" width="84" height="26" rx="7" fill={c.accent2} stroke={c.accent} strokeWidth="4" />
          <rect x="36" y="95" width="18" height="12" rx="3" fill={c.accent} />
          <line x1="16" y1="101" x2="36" y2="101" stroke={c.accent} strokeWidth="4" strokeLinecap="round" />
          <line x1="70" y1="88" x2="70" y2="114" stroke={c.accent} strokeWidth="3" />
          <line x1="90" y1="88" x2="90" y2="114" stroke={c.accent} strokeWidth="3" />
          <line x1="110" y1="88" x2="110" y2="114" stroke={c.accent} strokeWidth="3" />
        </g>
      );
    case 'drops':
      return (
        <g>
          <circle cx="100" cy="42" r="13" fill={c.accent} />
          <rect x="86" y="52" width="28" height="14" fill={c.soft} />
          <path d="M 80 66 L 120 66 L 116 148 Q 100 158 84 148 Z" fill={c.accent2} stroke={c.accent} strokeWidth="4" />
          <path d="M 100 118 C 92 130 92 138 100 142 C 108 138 108 130 100 118 Z" fill={c.accent} />
        </g>
      );
    case 'cream':
      return (
        <g>
          <path d="M 74 40 L 126 40 L 120 150 Q 100 158 80 150 Z" fill={c.accent2} stroke={c.accent} strokeWidth="4" />
          <rect x="80" y="26" width="40" height="16" rx="4" fill={c.accent} />
          <rect x="84" y="70" width="32" height="46" rx="8" fill="#ffffff" opacity="0.35" />
        </g>
      );
    case 'inhaler':
      return (
        <g>
          <rect x="88" y="30" width="24" height="18" rx="4" fill={c.accent} />
          <rect x="76" y="46" width="48" height="104" rx="12" fill={c.accent2} stroke={c.accent} strokeWidth="4" />
          <rect x="86" y="66" width="28" height="10" rx="4" fill={c.soft} />
          <circle cx="100" cy="120" r="12" fill="#ffffff" opacity="0.4" />
        </g>
      );
    default:
      return (
        <g>
          <path d="M 92 36 L 108 36 L 108 70 L 136 138 Q 142 152 126 152 L 74 152 Q 58 152 64 138 L 92 70 Z"
            fill={c.accent2} stroke={c.accent} strokeWidth="4" />
          <path d="M 76 116 L 124 116 L 136 138 Q 142 152 126 152 L 74 152 Q 58 152 64 138 Z"
            fill={c.accent} opacity="0.6" />
          <circle cx="100" cy="130" r="5" fill="#ffffff" opacity="0.6" />
        </g>
      );
  }
}

export function MedicineArt({ item }: { item: CatalogItem }) {
  const c = paletteFor(item);
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`${item.brandName} — ${item.dosageForm}`}
      className="h-full w-full"
      data-form={item.dosageForm}
    >
      <rect width="200" height="200" fill={c.bg} />
      <circle cx="164" cy="34" r="22" fill="#ffffff" opacity="0.35" />
      <circle cx="30" cy="170" r="14" fill="#ffffff" opacity="0.3" />
      <Glyph form={item.dosageForm} c={c} />
    </svg>
  );
}
