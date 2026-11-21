import { useState } from 'react';
import { Cloud, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

interface LockScreenProps {
  onUnlocked: () => void;
}

export function LockScreen({ onUnlocked }: LockScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        authenticated?: boolean;
        error?: string;
      };

      if (!res.ok || !data.authenticated) {
        setError(data.error || 'Incorrect password. Please try again.');
        setSubmitting(false);
        return;
      }

      setPassword('');
      onUnlocked();
    } catch {
      setError('Unable to reach server. Check your connection and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex justify-center bg-[#E8E3DA]">
      <div className="relative w-full max-w-[430px] min-h-dvh bg-[#FAF8F5] shadow-[0_0_50px_rgba(15,76,92,0.12)] sm:border-x sm:border-[#DDD6CA] flex flex-col justify-between px-5 py-10">
        {/* Top Brand Hero */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-[22px] overflow-hidden shadow-lg ring-4 ring-white mb-5">
            <img
              src="/icon-192.png"
              alt="Pine to Palm"
              className="w-full h-full object-cover"
            />
          </div>

          <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#C8533A] bg-[#E06D53]/12 px-2.5 py-1 rounded-full">
            Maine → Florida · Tier 2
          </span>
          <h1 className="font-display text-3xl font-semibold text-[#1A2426] mt-2.5 text-center">
            Pine to Palm
          </h1>
          <p className="text-xs text-[#5C6B6E] text-center mt-1.5 max-w-[260px] leading-relaxed">
            Enter your trip password to unlock your live itinerary, Airbnbs, and universal cloud plan.
          </p>

          {/* Password Card */}
          <form
            onSubmit={handleSubmit}
            className="w-full mt-7 rounded-3xl bg-white border border-[#E6E1D8] p-5 shadow-sm space-y-4"
          >
            <div>
              <label
                htmlFor="trip-password"
                className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B6E] flex items-center gap-1.5 mb-2"
              >
                <Lock className="w-3.5 h-3.5 text-[#0F4C5C]" /> App Password
              </label>

              <div className="relative">
                <input
                  id="trip-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Enter password"
                  className="w-full h-12 pl-4 pr-12 rounded-2xl bg-[#FAF8F5] border border-[#DFD9CE] text-[15px] text-[#1A2426] placeholder:text-[#98A3A5] focus:outline-none focus:border-[#0F4C5C] focus:ring-2 focus:ring-[#0F4C5C]/15"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-[#5C6B6E] active:scale-95"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="text-xs font-medium text-[#B84A32] bg-[#E06D53]/12 border border-[#E06D53]/25 rounded-xl px-3 py-2"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !password.trim()}
              className="w-full h-12 rounded-2xl bg-[#0F4C5C] text-white text-sm font-bold shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? 'Unlocking…' : 'Unlock Trip'}
            </button>
          </form>
        </div>

        {/* Footer Security + Universal Sync Note */}
        <div className="pt-6 flex items-center justify-center gap-4 text-[11px] text-[#6B7A7D]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F4C5C]" /> 30-day iPhone session
          </span>
          <span className="flex items-center gap-1">
            <Cloud className="w-3.5 h-3.5 text-[#2D6A4F]" /> Universal sync
          </span>
        </div>
      </div>
    </div>
  );
}
