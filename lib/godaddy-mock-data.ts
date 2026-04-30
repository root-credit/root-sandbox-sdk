/**
 * Mocked domain inventory for the GoDaddy reskin.
 *
 * Domain ownership and the marketplace are purely mocked — the real Root SDK
 * has no concept of "domains". These records live in component state and are
 * intentionally not persisted to Redis.
 */
import type { Money } from '@/lib/types/payments';

export type DomainCategory = 'tech' | 'business' | 'creative' | 'finance' | 'lifestyle';

export type OwnedDomain = {
  id: string;
  name: string;
  registeredAt: string;
  /** When listed, the asking price in cents. Undefined when not listed. */
  listingPriceCents?: Money;
};

export type MarketplaceDomain = {
  id: string;
  name: string;
  priceCents: Money;
  sellerHandle: string;
  category: DomainCategory;
  trafficScore: number;
  description: string;
};

export const initialOwnedDomains: OwnedDomain[] = [
  {
    id: 'own-1',
    name: 'rocketloft.io',
    registeredAt: '2024-04-12',
  },
  {
    id: 'own-2',
    name: 'pixelpath.com',
    registeredAt: '2023-09-02',
    listingPriceCents: 250000,
  },
  {
    id: 'own-3',
    name: 'goldenfox.dev',
    registeredAt: '2024-11-30',
  },
  {
    id: 'own-4',
    name: 'northwind.shop',
    registeredAt: '2025-02-18',
  },
];

export const initialMarketplaceDomains: MarketplaceDomain[] = [
  {
    id: 'mkt-1',
    name: 'cloudwave.io',
    priceCents: 199000,
    sellerHandle: '@alex.m',
    category: 'tech',
    trafficScore: 84,
    description: 'Short, punchy, perfect for an infrastructure or storage product.',
  },
  {
    id: 'mkt-2',
    name: 'fieldnotes.co',
    priceCents: 84500,
    sellerHandle: '@sara.k',
    category: 'creative',
    trafficScore: 71,
    description: 'A clean editorial name for a journaling, notes, or media brand.',
  },
  {
    id: 'mkt-3',
    name: 'midnightcredit.com',
    priceCents: 545000,
    sellerHandle: '@finance.guild',
    category: 'finance',
    trafficScore: 92,
    description: 'Premium fintech name with a memorable, two-word ring.',
  },
  {
    id: 'mkt-4',
    name: 'studioloop.app',
    priceCents: 129500,
    sellerHandle: '@loopworks',
    category: 'creative',
    trafficScore: 67,
    description: 'Catchy SaaS-ready name aimed at design or production tools.',
  },
  {
    id: 'mkt-5',
    name: 'evergreen.shop',
    priceCents: 320000,
    sellerHandle: '@tradeworks',
    category: 'business',
    trafficScore: 78,
    description: 'Sustainable, evergreen retail brand. Pre-built audience appeal.',
  },
  {
    id: 'mkt-6',
    name: 'humbleharvest.co',
    priceCents: 67500,
    sellerHandle: '@farm.nest',
    category: 'lifestyle',
    trafficScore: 58,
    description: 'Warm, friendly name for a food, wellness, or DTC brand.',
  },
  {
    id: 'mkt-7',
    name: 'stackmint.dev',
    priceCents: 215000,
    sellerHandle: '@devshop',
    category: 'tech',
    trafficScore: 81,
    description: 'Developer-flavored handle that pairs well with an open-source tool.',
  },
  {
    id: 'mkt-8',
    name: 'paperboat.club',
    priceCents: 49000,
    sellerHandle: '@midwest.media',
    category: 'lifestyle',
    trafficScore: 45,
    description: 'Playful community or membership domain with a nostalgic feel.',
  },
];

export const categoryLabels: Record<DomainCategory, string> = {
  tech: 'Tech',
  business: 'Business',
  creative: 'Creative',
  finance: 'Finance',
  lifestyle: 'Lifestyle',
};
