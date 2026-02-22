export interface DummyTrack {
  id: string;
  title: string;
  artistName: string;
  durationSec: number;
  coverUrl: string;
  pointsPerListen: number;
  campaign: {
    id: string;
    name: string;
    minListenSeconds: number;
    costPerListen: number;
    status: string;
    budgetPoints: number;
    spentPoints: number;
  };
}

export interface DummyCampaign {
  id: string;
  name: string;
  status: string;
  budgetPoints: number;
  spentPoints: number;
  costPerListen: number;
  minListenSeconds: number;
  trackCount: number;
  totalListens: number;
}

export interface DummyLedgerEntry {
  id: string;
  type: "REWARD" | "BONUS";
  amount: number;
  createdAt: string;
  trackTitle?: string;
}

function picsumUrl(seed: number, size = 300) {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`;
}

export const DUMMY_TRACKS: DummyTrack[] = [
  {
    id: "dummy-1",
    title: "Midnight Drive",
    artistName: "Luna Vega",
    durationSec: 214,
    coverUrl: picsumUrl(101),
    pointsPerListen: 5,
    campaign: { id: "dc-1", name: "Luna Vega Promo", minListenSeconds: 30, costPerListen: 5, status: "ACTIVE", budgetPoints: 5000, spentPoints: 1200 },
  },
  {
    id: "dummy-2",
    title: "Neon Skyline",
    artistName: "Drift Theory",
    durationSec: 198,
    coverUrl: picsumUrl(102),
    pointsPerListen: 8,
    campaign: { id: "dc-2", name: "Drift Theory Launch", minListenSeconds: 45, costPerListen: 8, status: "ACTIVE", budgetPoints: 10000, spentPoints: 3400 },
  },
  {
    id: "dummy-3",
    title: "Golden Hour",
    artistName: "Amber Rose",
    durationSec: 243,
    coverUrl: picsumUrl(103),
    pointsPerListen: 6,
    campaign: { id: "dc-3", name: "Amber Rose Album Push", minListenSeconds: 30, costPerListen: 6, status: "ACTIVE", budgetPoints: 8000, spentPoints: 2100 },
  },
  {
    id: "dummy-4",
    title: "Electric Dreams",
    artistName: "Synthwave Collective",
    durationSec: 186,
    coverUrl: picsumUrl(104),
    pointsPerListen: 4,
    campaign: { id: "dc-1", name: "Luna Vega Promo", minListenSeconds: 30, costPerListen: 4, status: "ACTIVE", budgetPoints: 5000, spentPoints: 1200 },
  },
  {
    id: "dummy-5",
    title: "Velvet Nights",
    artistName: "Luna Vega",
    durationSec: 225,
    coverUrl: picsumUrl(105),
    pointsPerListen: 5,
    campaign: { id: "dc-1", name: "Luna Vega Promo", minListenSeconds: 30, costPerListen: 5, status: "ACTIVE", budgetPoints: 5000, spentPoints: 1200 },
  },
  {
    id: "dummy-6",
    title: "Pulse",
    artistName: "KXNE",
    durationSec: 167,
    coverUrl: picsumUrl(106),
    pointsPerListen: 10,
    campaign: { id: "dc-4", name: "KXNE Breakout", minListenSeconds: 60, costPerListen: 10, status: "ACTIVE", budgetPoints: 15000, spentPoints: 6800 },
  },
  {
    id: "dummy-7",
    title: "Bloom",
    artistName: "Petal",
    durationSec: 201,
    coverUrl: picsumUrl(107),
    pointsPerListen: 3,
    campaign: { id: "dc-3", name: "Amber Rose Album Push", minListenSeconds: 30, costPerListen: 3, status: "ACTIVE", budgetPoints: 8000, spentPoints: 2100 },
  },
  {
    id: "dummy-8",
    title: "Gravity",
    artistName: "Orbit",
    durationSec: 259,
    coverUrl: picsumUrl(108),
    pointsPerListen: 7,
    campaign: { id: "dc-2", name: "Drift Theory Launch", minListenSeconds: 45, costPerListen: 7, status: "ACTIVE", budgetPoints: 10000, spentPoints: 3400 },
  },
  {
    id: "dummy-9",
    title: "Static",
    artistName: "Noisemaker",
    durationSec: 178,
    coverUrl: picsumUrl(109),
    pointsPerListen: 5,
    campaign: { id: "dc-4", name: "KXNE Breakout", minListenSeconds: 60, costPerListen: 5, status: "ACTIVE", budgetPoints: 15000, spentPoints: 6800 },
  },
  {
    id: "dummy-10",
    title: "Daydream",
    artistName: "Amber Rose",
    durationSec: 233,
    coverUrl: picsumUrl(110),
    pointsPerListen: 6,
    campaign: { id: "dc-3", name: "Amber Rose Album Push", minListenSeconds: 30, costPerListen: 6, status: "ACTIVE", budgetPoints: 8000, spentPoints: 2100 },
  },
  {
    id: "dummy-11",
    title: "Frequency",
    artistName: "Drift Theory",
    durationSec: 192,
    coverUrl: picsumUrl(111),
    pointsPerListen: 8,
    campaign: { id: "dc-2", name: "Drift Theory Launch", minListenSeconds: 45, costPerListen: 8, status: "ACTIVE", budgetPoints: 10000, spentPoints: 3400 },
  },
  {
    id: "dummy-12",
    title: "After Rain",
    artistName: "Petal",
    durationSec: 210,
    coverUrl: picsumUrl(112),
    pointsPerListen: 3,
    campaign: { id: "dc-3", name: "Amber Rose Album Push", minListenSeconds: 30, costPerListen: 3, status: "ACTIVE", budgetPoints: 8000, spentPoints: 2100 },
  },
];

export const DUMMY_CAMPAIGNS: DummyCampaign[] = [
  { id: "dc-1", name: "Luna Vega Promo", status: "ACTIVE", budgetPoints: 5000, spentPoints: 1200, costPerListen: 5, minListenSeconds: 30, trackCount: 3, totalListens: 240 },
  { id: "dc-2", name: "Drift Theory Launch", status: "ACTIVE", budgetPoints: 10000, spentPoints: 3400, costPerListen: 8, minListenSeconds: 45, trackCount: 2, totalListens: 425 },
  { id: "dc-3", name: "Amber Rose Album Push", status: "PAUSED", budgetPoints: 8000, spentPoints: 2100, costPerListen: 6, minListenSeconds: 30, trackCount: 4, totalListens: 350 },
  { id: "dc-4", name: "KXNE Breakout", status: "ACTIVE", budgetPoints: 15000, spentPoints: 6800, costPerListen: 10, minListenSeconds: 60, trackCount: 2, totalListens: 680 },
];

export const DUMMY_WALLET = {
  balance: 1247,
  weeklyDelta: 183,
};

export const DUMMY_LEDGER: DummyLedgerEntry[] = [
  { id: "dl-1", type: "REWARD", amount: 5, createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), trackTitle: "Midnight Drive" },
  { id: "dl-2", type: "REWARD", amount: 8, createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), trackTitle: "Neon Skyline" },
  { id: "dl-3", type: "BONUS", amount: 50, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: "dl-4", type: "REWARD", amount: 6, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), trackTitle: "Golden Hour" },
  { id: "dl-5", type: "REWARD", amount: 10, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), trackTitle: "Pulse" },
  { id: "dl-6", type: "REWARD", amount: 5, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), trackTitle: "Velvet Nights" },
  { id: "dl-7", type: "BONUS", amount: 100, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  { id: "dl-8", type: "REWARD", amount: 7, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), trackTitle: "Gravity" },
];
