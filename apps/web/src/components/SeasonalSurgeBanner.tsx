'use client';

import { ArrowRight, CloudFog, Droplets, HeartPulse, Wind } from 'lucide-react';

export type DelhiSurgeType = 'smog' | 'monsoon' | 'chronic';

interface SurgeCampaign {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Wind;
  action: string;
  theme: string;
  accent: string;
  chip: string;
}

/**
 * Configuration-driven seasonal campaigns. The displayed campaign is chosen
 * from the calendar month (matching the dataset's Delhi_Surge_Profile bands:
 * Monsoon_Vector Jul–Oct, Smog_Surge Oct–Feb, Chronic_Refill year-round) —
 * it never claims live AQI or outbreak data.
 */
const campaignConfig: Record<DelhiSurgeType, SurgeCampaign> = {
  smog: {
    eyebrow: 'DELHI-NCR · WINTER SMOG SEASON (OCT–FEB)',
    title: 'Smog season, better prepared.',
    description:
      'Respiratory-care and allergy essentials are stocked up. Use medicines only as directed by your clinician or the label.',
    icon: Wind,
    action: 'Explore respiratory care',
    theme: 'border-delhi-marigold/30 bg-[#241b12]',
    accent: 'text-delhi-marigold',
    chip: 'bg-delhi-marigold/15',
  },
  monsoon: {
    eyebrow: 'DELHI-NCR · MONSOON (JUL–OCT)',
    title: 'Monsoon essentials, made easier.',
    description:
      'ORS, repellents and everyday healthcare essentials are restocked. Know when symptoms need professional attention.',
    icon: Droplets,
    action: 'Browse monsoon essentials',
    theme: 'border-sky-400/25 bg-[#101c26]',
    accent: 'text-sky-300',
    chip: 'bg-sky-400/10',
  },
  chronic: {
    eyebrow: 'ROUTINE CARE · REFILLS',
    title: 'Stay on top of routine refills.',
    description:
      'Find your prescribed formulation and strength. Confirm any generic substitution with your pharmacist or prescriber.',
    icon: HeartPulse,
    action: 'Find a formulation',
    theme: 'border-delhi-green/30 bg-[#0f1f18]',
    accent: 'text-delhi-green',
    chip: 'bg-delhi-green/10',
  },
};

export function surgeTypeForMonth(date: Date = new Date()): DelhiSurgeType {
  const month = date.getMonth(); // 0-indexed
  if (month >= 9 || month === 0) return 'smog'; // Oct–Feb
  if (month >= 6) return 'monsoon'; // Jul–Sep (monsoon band runs to Oct)
  return 'chronic';
}

interface SeasonalSurgeBannerProps {
  type: DelhiSurgeType;
  onExplore?: (type: DelhiSurgeType) => void;
}

export function SeasonalSurgeBanner({ type, onExplore }: SeasonalSurgeBannerProps) {
  const campaign = campaignConfig[type];
  const Icon = campaign.icon;

  return (
    <section
      aria-labelledby={`surge-title-${type}`}
      className={`relative isolate overflow-hidden rounded-2xl border p-5 ${campaign.theme}`}
    >
      {/* Decorative Mughal arch + jali lattice motif */}
      <div
        className="pointer-events-none absolute -right-8 -top-12 size-52 rounded-t-full border border-white/10 opacity-60"
        aria-hidden="true"
      >
        <div className="absolute inset-5 rounded-t-full border border-white/10" />
        <div
          className="absolute inset-0 rounded-t-full opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent 0 8px, #FAF7F2 8px 9px)',
          }}
        />
      </div>

      <div className="relative flex items-start gap-4">
        <div className={`hidden shrink-0 rounded-2xl border border-white/10 bg-black/20 p-3 sm:block ${campaign.chip} ${campaign.accent}`}>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className={`flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] ${campaign.accent}`}>
            <span aria-hidden="true">✦</span>
            {campaign.eyebrow}
          </div>

          <h2 id={`surge-title-${type}`} className="font-display mt-2 max-w-xl text-xl font-bold tracking-tight text-delhi-paper sm:text-2xl">
            {campaign.title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">{campaign.description}</p>

          {onExplore && (
            <button
              type="button"
              onClick={() => onExplore(type)}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-delhi-paper transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-delhi-marigold"
            >
              {campaign.action}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
