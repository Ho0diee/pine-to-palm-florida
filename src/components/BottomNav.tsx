import {
  CalendarDays,
  Compass,
  Home,
  Plane,
  Utensils,
} from 'lucide-react';
import type { TabId } from '../types/trip';

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  mealCount: number;
  placeCount: number;
}

const NAV_ITEMS: {
  id: TabId;
  label: string;
  icon: typeof CalendarDays;
}[] = [
  { id: 'plan', label: 'Plan', icon: CalendarDays },
  { id: 'trip', label: 'Trip Down', icon: Plane },
  { id: 'stay', label: 'Airbnb', icon: Home },
  { id: 'eat', label: 'Eat', icon: Utensils },
  { id: 'explore', label: 'Go & Map', icon: Compass },
];

export function BottomNav({
  activeTab,
  onChange,
  mealCount,
  placeCount,
}: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E6E1D8] px-2 pt-1.5 safe-pb"
      aria-label="Primary navigation"
    >
      <div className="grid grid-cols-5 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge =
            item.id === 'eat'
              ? mealCount
              : item.id === 'explore'
                ? placeCount
                : undefined;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`relative flex flex-col items-center justify-center min-h-[50px] rounded-2xl transition-all active:scale-95 ${
                isActive
                  ? 'text-[#0F4C5C] bg-[#0F4C5C]/10 font-semibold'
                  : 'text-[#6A787B] hover:text-[#1A2426]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-[20px] h-[20px] ${
                    isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
                {badge !== undefined && badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      isActive
                        ? 'bg-[#E06D53] text-white'
                        : 'bg-[#E6E1D8] text-[#1A2426]'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[10.5px] leading-none mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
