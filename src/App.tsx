import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { BudgetSheet } from './components/BudgetSheet';
import { EatView } from './components/EatView';
import { ExploreView } from './components/ExploreView';
import { LockScreen } from './components/LockScreen';
import { PlanView } from './components/PlanView';
import { StayView } from './components/StayView';
import { TopBar, type SyncState } from './components/TopBar';
import { TripDownView } from './components/TripDownView';
import { DEFAULT_TRIP_CONFIG } from './data/tripData';
import type { TabId, TripConfig } from './types/trip';
import { calculateBudget } from './utils/budget';

const STORAGE_KEY = 'pine-to-palm-tier2-v1';

function loadCachedConfig(): TripConfig {
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
  const [authStatus, setAuthStatus] = useState<'checking' | 'locked' | 'unlocked'>('checking');
  const [cloudEnabled, setCloudEnabled] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [config, setConfig] = useState<TripConfig>(loadCachedConfig);
  const [activeTab, setActiveTab] = useState<TabId>('plan');
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetInitialTab, setBudgetInitialTab] = useState<'budget' | 'checklist'>(
    'budget'
  );

  // Track whether initial cloud hydration finished so we don't immediately overwrite cloud with stale cache
  const hydratedRef = useRef(false);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);

  const pullFromCloud = useCallback(async () => {
    setSyncState('loading');
    try {
      const res = await fetch('/api/trip', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });

      if (res.status === 401) {
        setAuthStatus('locked');
        return;
      }

      if (!res.ok) {
        setSyncState('error');
        return;
      }

      const data = (await res.json()) as {
        config: Partial<TripConfig> | null;
        updatedAt: string | null;
      };

      if (data.config && typeof data.config === 'object') {
        const merged = { ...DEFAULT_TRIP_CONFIG, ...data.config };
        dirtyRef.current = false;
        setConfig(merged);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore storage quota errors
        }
        setLastSyncedAt(data.updatedAt);
      } else {
        // First time ever: seed cloud with current config
        dirtyRef.current = true;
      }

      hydratedRef.current = true;
      setSyncState('synced');
    } catch {
      hydratedRef.current = true;
      setSyncState('error');
    }
  }, []);

  // Check session on startup
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });

        // If running plain Vite locally without Vercel Functions, /api/auth returns 404 or HTML
        const contentType = res.headers.get('content-type') || '';
        const isLocalDev =
          (window.location.hostname === 'localhost' ||
            window.location.hostname.startsWith('192.168.') ||
            window.location.hostname === '127.0.0.1') &&
          (!res.ok || !contentType.includes('application/json'));

        if (isLocalDev) {
          if (!active) return;
          setCloudEnabled(false);
          setSyncState('local');
          hydratedRef.current = true;
          setAuthStatus('unlocked');
          return;
        }

        if (!res.ok) {
          if (!active) return;
          setAuthStatus('locked');
          return;
        }

        const data = (await res.json()) as { authenticated?: boolean };
        if (!active) return;

        if (data.authenticated) {
          setAuthStatus('unlocked');
          await pullFromCloud();
        } else {
          setAuthStatus('locked');
        }
      } catch {
        if (!active) return;
        setAuthStatus('locked');
      }
    })();

    return () => {
      active = false;
    };
  }, [pullFromCloud]);

  // Refresh from cloud whenever returning to the iPhone app from background
  useEffect(() => {
    if (authStatus !== 'unlocked' || !cloudEnabled) return;

    const handleVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        hydratedRef.current &&
        !dirtyRef.current &&
        !savingRef.current
      ) {
        void pullFromCloud();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [authStatus, cloudEnabled, pullFromCloud]);

  // Persist locally & debounce universal cloud save
  useEffect(() => {
    if (authStatus !== 'unlocked') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore storage quota errors
    }

    if (!cloudEnabled || !hydratedRef.current || !dirtyRef.current) return;

    setSyncState('saving');
    const timer = window.setTimeout(async () => {
      savingRef.current = true;
      try {
        const res = await fetch('/api/trip', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ config }),
        });

        if (res.status === 401) {
          setAuthStatus('locked');
          return;
        }

        if (!res.ok) {
          setSyncState('error');
          return;
        }

        const data = (await res.json()) as { updatedAt?: string };
        dirtyRef.current = false;
        setLastSyncedAt(data.updatedAt ?? new Date().toISOString());
        setSyncState('synced');
      } catch {
        setSyncState('error');
      } finally {
        savingRef.current = false;
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [config, authStatus, cloudEnabled]);

  const updateConfig = useCallback(
    (updater: (prev: TripConfig) => TripConfig) => {
      dirtyRef.current = true;
      setConfig(updater);
    },
    []
  );

  const handleReset = useCallback(() => {
    dirtyRef.current = true;
    setConfig(DEFAULT_TRIP_CONFIG);
  }, []);

  const handleLockApp = useCallback(async () => {
    setBudgetOpen(false);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // ignore
    }
    hydratedRef.current = false;
    setAuthStatus('locked');
  }, []);

  const handleUnlocked = useCallback(() => {
    setAuthStatus('unlocked');
    void pullFromCloud();
  }, [pullFromCloud]);

  const budget = useMemo(() => calculateBudget(config), [config]);

  const openBudgetSheet = (tab: 'budget' | 'checklist' = 'budget') => {
    setBudgetInitialTab(tab);
    setBudgetOpen(true);
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  if (authStatus === 'checking') {
    return (
      <div className="min-h-dvh w-full flex justify-center bg-[#E8E3DA]">
        <div className="w-full max-w-[430px] min-h-dvh bg-[#FAF8F5] flex flex-col items-center justify-center gap-3 px-6">
          <img
            src="/icon-192.png"
            alt="Pine to Palm"
            className="w-16 h-16 rounded-2xl shadow-md animate-pulse"
          />
          <p className="text-xs font-semibold text-[#5C6B6E]">
            Loading Pine to Palm…
          </p>
        </div>
      </div>
    );
  }

  if (authStatus === 'locked') {
    return <LockScreen onUnlocked={handleUnlocked} />;
  }

  return (
    <div className="min-h-dvh w-full flex justify-center bg-[#E8E3DA]">
      {/* Dedicated Phone Layout Shell: full-bleed on phones, sleek 430px phone viewport on larger screens */}
      <div className="relative w-full max-w-[430px] min-h-dvh bg-[#FAF8F5] shadow-[0_0_50px_rgba(15,76,92,0.12)] sm:border-x sm:border-[#DDD6CA] flex flex-col">
        <TopBar
          config={config}
          budget={budget}
          syncState={syncState}
          onOpenBudget={openBudgetSheet}
        />

        <main className="flex-1 px-4 pt-3.5 pb-24">
          {activeTab === 'plan' && (
            <PlanView
              config={config}
              budget={budget}
              onUpdateConfig={updateConfig}
              onNavigateTab={handleTabChange}
              onOpenBudget={() => openBudgetSheet('budget')}
            />
          )}

          {activeTab === 'trip' && (
            <TripDownView
              config={config}
              budget={budget}
              onUpdateConfig={updateConfig}
            />
          )}

          {activeTab === 'stay' && (
            <StayView
              config={config}
              budget={budget}
              onUpdateConfig={updateConfig}
            />
          )}

          {activeTab === 'eat' && (
            <EatView
              config={config}
              budget={budget}
              onUpdateConfig={updateConfig}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreView
              config={config}
              budget={budget}
              onUpdateConfig={updateConfig}
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
          syncState={syncState}
          lastSyncedAt={lastSyncedAt}
          cloudEnabled={cloudEnabled}
          onClose={() => setBudgetOpen(false)}
          onUpdateConfig={updateConfig}
          onReset={handleReset}
          onRefreshCloud={() => void pullFromCloud()}
          onLockApp={() => void handleLockApp()}
        />
      </div>
    </div>
  );
}

export default App;
