import { specifications } from '@/modules/listings/types';

export const specificationPlaceholders: Record<
  keyof typeof specifications,
  string
> = {
  brand: 'e.g., Apple, Dell, HP',
  model: 'e.g., MacBook Pro 16"',
  processor: 'e.g., Intel Core i7, M2 Pro',
  ram: 'e.g., 16GB DDR4',
  storage: 'e.g., 512GB SSD',
  graphics_card: 'e.g., NVIDIA RTX 3060',
  display: 'e.g., 15.6" FHD IPS',
  operating_system: 'e.g., Windows 11, macOS',
  warranty: 'e.g., 1 year manufacturer warranty',
  battery: 'e.g., 80Wh, 10 hours',
};
