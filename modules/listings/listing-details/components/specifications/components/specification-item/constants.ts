import {
  Building2,
  Tag,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Laptop,
  ShieldCheck,
  Info,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping for standard specifications
export const SPEC_ICON_MAP: Record<string, LucideIcon> = {
  brand: Building2,
  model: Tag,
  processor: Cpu,
  ram: MemoryStick,
  storage: HardDrive,
  'graphics card': Monitor,
  display: Monitor,
  battery: Battery,
  'operating system': Laptop,
  os: Laptop,
  'warranty status': ShieldCheck,
  warranty: ShieldCheck,
};

// Default icon for custom specifications
export const DEFAULT_SPEC_ICON = Info;

export const getSpecIcon = (label: string, isCustom?: boolean): LucideIcon => {
  if (isCustom) return DEFAULT_SPEC_ICON;

  const normalizedLabel = label.toLowerCase().trim();
  return SPEC_ICON_MAP[normalizedLabel] || DEFAULT_SPEC_ICON;
};
