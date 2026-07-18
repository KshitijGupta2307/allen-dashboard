/**
 * Fixed category → palette-slot registries. Color must follow the entity, never
 * its rank in a sorted/filtered list, so each known value always resolves to the
 * same CSS custom property.
 */
const PLATFORM_SLOT: Record<string, string> = {
  Instagram: "--series-1",
  YouTube: "--series-6",
  Facebook: "--series-5",
  Twitter: "--series-3",
  Reddit: "--series-8",
  Telegram: "--series-2",
  LinkedIn: "--series-7",
  Weblink: "--series-4",
  Unknown: "--text-muted",
  Other: "--text-muted",
};

const CONTENT_TYPE_SLOT: Record<string, string> = {
  Defamation: "--series-6",
  Copyright: "--series-1",
  Piracy: "--series-8",
  Impersonation: "--series-5",
  Other: "--series-3",
  Unspecified: "--text-muted",
};

const STATUS_SLOT: Record<string, string> = {
  removed: "--status-good",
  pending: "--status-warning",
  "not-reported": "--text-muted",
};

/** Darker variants used specifically for text sitting on a status color's own tint (badges) — see index.css.
 * "not-reported" uses --text-secondary rather than --text-muted here: --text-muted on its own 14% tint
 * measures ~4.0:1, just under the 4.5:1 AA threshold; --text-secondary comfortably clears it. */
const STATUS_TEXT_SLOT: Record<string, string> = {
  removed: "--status-good-text",
  pending: "--status-warning-text",
  "not-reported": "--text-secondary",
};

const FALLBACK_ORDER = [
  "--series-1",
  "--series-2",
  "--series-3",
  "--series-4",
  "--series-5",
  "--series-6",
  "--series-7",
  "--series-8",
];

function resolveVar(varName: string): string {
  return `var(${varName})`;
}

function fallbackSlot(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return FALLBACK_ORDER[hash % FALLBACK_ORDER.length];
}

export function platformColor(platform: string): string {
  return resolveVar(PLATFORM_SLOT[platform] ?? fallbackSlot(platform));
}

export function contentTypeColor(type: string): string {
  return resolveVar(CONTENT_TYPE_SLOT[type] ?? fallbackSlot(type));
}

export function statusColor(status: keyof typeof STATUS_SLOT): string {
  return resolveVar(STATUS_SLOT[status]);
}

export function statusTextColor(status: keyof typeof STATUS_TEXT_SLOT): string {
  return resolveVar(STATUS_TEXT_SLOT[status]);
}

export function seqColor(step: 100 | 250 | 400 | 450 | 500 | 600): string {
  return resolveVar(`--seq-${step}`);
}
