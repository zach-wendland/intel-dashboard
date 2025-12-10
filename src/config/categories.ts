import {
  BookOpen,
  Radio,
  Zap,
  Globe,
  ShieldAlert,
  Server
} from 'lucide-react';
import type { CategoryConfig } from '../types';

export const SOURCE_CATEGORIES: Record<string, CategoryConfig> = {
  INTELLECTUALS: {
    label: "Paleoconservative Vanguard",
    icon: BookOpen,
    color: "text-blue-400"
  },
  BROADCAST: {
    label: "MAGA Broadcast Network",
    icon: Radio,
    color: "text-red-400"
  },
  RADICALS: {
    label: "Dissident Right / Groypers",
    icon: Zap,
    color: "text-yellow-400"
  },
  LIBERTARIANS: {
    label: "Libertarian / Anti-War",
    icon: Globe,
    color: "text-green-400"
  },
  THEOLOGIANS: {
    label: "Theological Dissent",
    icon: ShieldAlert,
    color: "text-purple-400"
  },
  INFRASTRUCTURE: {
    label: "Digital Infrastructure",
    icon: Server,
    color: "text-gray-400"
  }
};

// Category keys for iteration
export const CATEGORY_KEYS = Object.keys(SOURCE_CATEGORIES);
