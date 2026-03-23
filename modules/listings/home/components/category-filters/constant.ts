import { CategoryType } from '@/modules/listings/types';
import {
  Laptop,
  Smartphone,
  Headphones,
  Camera,
  Keyboard,
  Monitor,
  Cpu,
  Zap,
} from 'lucide-react';

export const categoryIconMap: Record<CategoryType, React.ElementType> = {
  'Laptops & Computers': Laptop,
  'Mobile Phones': Smartphone,
  'Computer Parts': Cpu,
  'Routers & Networking': Zap,
  'Keyboards & Mice': Keyboard,
  'Headphones & Speakers': Headphones,
  'Chargers & Cables': Zap,
  'Monitors & Screens': Monitor,
  Cameras: Camera,
  'Phone Accessories': Keyboard,
};
