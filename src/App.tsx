import { useEffect, useMemo, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { BudgetSheet } from './components/BudgetSheet';
import { EatView } from './components/EatView';
import { ExploreView } from './components/ExploreView';
import { PlanView } from './components/PlanView';
import { StayView } from './components/StayView';
import { TopBar } from './components/TopBar';
import { TripDownView } from './components/TripDownView';
import { DEFAULT_TRIP_CONFIG } from './data/tripData';
import type { TabId, TripConfig } from './types/trip';
import { calculateBudget } from './utils/budget';

const STORAGE_KEY = 'pine-to-palm-tier2-v1';

function loadInitialConfig(): TripConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TRIP_CONFIG;
    const parsed = JSON.parse(raw) as Partial<TripConfig>;
    return { ...DEFAULT_TRIP_CONFIG, ...parsed };
  } catch {
    return DEFAULT_TRIP_CONFIG;
  }
}

export function App() {
  const [config, setConfig] = useState<TripConfig>(loadInitialConfig);
  const [activeTab, setActiveTab] = useState<TabId>('plan');
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetInitialTab, setBudgetInitialTab] = useState<'budget' | 'checklist'>(
    'budget'
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore storage quota errors
    }
  }, [config]);

  const budget = useMemo(() => calculateBudget(config), [config]);

  const openBudgetSheet = (tab: 'budget' | 'checklist' = 'budget') => {
    setBudgetInitialTab(tab);
    setBudgetOpen(true);
  };

  const handleReset = () => {
    setConfig(DEFAULT_TRIP_CONFIG);
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-dvh w-full flex justify-center bg-[#E8E3DA]">
      {/* Dedicated Phone Layout Shell: full-bleed on phones, sleek 430px phone viewport on larger screens */}
      <div className="relative w-full max-w-[430px] min-h-dvh bg-[#FAF8F5] shadow-[0_0_50px_rgba(15,76,92,0.12)] sm:border-x sm:border-[#DDD6CA] flex flex-col">
        <TopBar
          config={config}
          budget={budget}
          onOpenBudget={openBudgetSheet}
        />

        <main className="flex-1 px-4 pt-3.5 pb-24">
          {activeTab === 'plan' && (
            <PlanView
              config={config}
              budget={budget}
              onUpdateConfig={setConfig}
              onNavigateTab={handleTabChange}
              onOpenBudget={() => openBudgetSheet('budget')}
            />
          )}

          {activeTab === 'trip' && (
            <TripDownView
              config={config}
              budget={budget}
              onUpdateConfig={setConfig}
            />
          )}

          {activeTab === 'stay' && (
            <StayView
              config={config}
              budget={budget}
              onUpdateConfig={setConfig}
            />
          )}

          {activeTab === 'eat' && (
            <EatView
              config={config}
              budget={budget}
              onUpdateConfig={setConfig}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreView
              config={config}
              budget={budget}
              onUpdateConfig={setConfig}
            />
          )}
        </main>

        <BottomNav
          activeTab={activeTab}
          onChange={handleTabChange}
          mealCount={config.selectedRestaurantIds.length}
          placeCount={config.selectedAttractionIds.length}
        />

        <BudgetSheet
          open={budgetOpen}
          initialTab={budgetInitialTab}
          config={config}
          budget={budget}
          onClose={() => setBudgetOpen(false)}
          onUpdateConfig={setConfig}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}

export default App;
