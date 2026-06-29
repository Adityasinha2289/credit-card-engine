/**
 * CATEGORY ICON MAP
 *
 * Maps each TransactionCategory to a Lucide icon component + a
 * hand-tuned color palette (bg, icon fill/stroke, glow).
 *
 * All icons render at size 18 inside a 40px circular container.
 */

import {
  UtensilsCrossed,
  Plane,
  ShoppingCart,
  Tv,
  Zap,
  ShoppingBag,
  Heart,
  Car,
  RefreshCcw,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';
import type { TransactionCategory } from '../../dashboard/types/dashboard.types';

export interface CategoryStyle {
  Icon:      LucideIcon;
  /** Tailwind bg class for the icon bubble */
  bgClass:   string;
  /** Tailwind text/stroke colour class for the icon itself */
  iconClass: string;
  /** Inline rgba for the subtle drop-shadow on the bubble */
  glowColor: string;
  /** Human-readable label */
  label:     string;
}

export const CATEGORY_STYLES: Record<TransactionCategory, CategoryStyle> = {
  dining: {
    Icon:      UtensilsCrossed,
    bgClass:   'bg-orange-50',
    iconClass: 'text-orange-500',
    glowColor: 'rgba(249, 115, 22, 0.18)',
    label:     'Dining',
  },
  travel: {
    Icon:      Plane,
    bgClass:   'bg-sky-50',
    iconClass: 'text-sky-500',
    glowColor: 'rgba(14, 165, 233, 0.18)',
    label:     'Travel',
  },
  groceries: {
    Icon:      ShoppingCart,
    bgClass:   'bg-sage-50',
    iconClass: 'text-sage-500',
    glowColor: 'rgba(104, 123, 111, 0.18)',
    label:     'Groceries',
  },
  entertainment: {
    Icon:      Tv,
    bgClass:   'bg-purple-50',
    iconClass: 'text-purple-500',
    glowColor: 'rgba(168, 85, 247, 0.18)',
    label:     'Entertainment',
  },
  utilities: {
    Icon:      Zap,
    bgClass:   'bg-yellow-50',
    iconClass: 'text-yellow-500',
    glowColor: 'rgba(234, 179, 8, 0.18)',
    label:     'Utilities',
  },
  shopping: {
    Icon:      ShoppingBag,
    bgClass:   'bg-pink-50',
    iconClass: 'text-pink-500',
    glowColor: 'rgba(236, 72, 153, 0.18)',
    label:     'Shopping',
  },
  health: {
    Icon:      Heart,
    bgClass:   'bg-rose-50',
    iconClass: 'text-rose-500',
    glowColor: 'rgba(244, 63, 94, 0.18)',
    label:     'Health',
  },
  transport: {
    Icon:      Car,
    bgClass:   'bg-steel-50',
    iconClass: 'text-steel-500',
    glowColor: 'rgba(69, 97, 113, 0.18)',
    label:     'Transport',
  },
  subscriptions: {
    Icon:      RefreshCcw,
    bgClass:   'bg-violet-50',
    iconClass: 'text-violet-500',
    glowColor: 'rgba(139, 92, 246, 0.18)',
    label:     'Subscriptions',
  },
  other: {
    Icon:      MoreHorizontal,
    bgClass:   'bg-gray-100',
    iconClass: 'text-gray-400',
    glowColor: 'rgba(107, 114, 128, 0.12)',
    label:     'Other',
  },
};
