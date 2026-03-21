import React from 'react'
import { Lock, Layers, ShieldCheck, LayoutGrid } from 'lucide-react'

/* ─── tiny inline SVG icons ─────────────────────────── */
const LockIcon = ({ size = 18, color = '#f87171' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1.2" fill={color} stroke="none" />
  </svg>
)

/* ─── bubble components ──────────────────────────────── */
const Bubble = ({ text, self, color }) => (
  <div className={`flex mb-1.5 ${self ? 'justify-end' : 'justify-start'}`}>
    <span
      className="text-[11px] rounded-xl px-3 py-1.5 max-w-[78%]"
      style={self
        ? { background: `${color}18`, color, border: `1px solid ${color}25` }
        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }
      }
    >
      {text}
    </span>
  </div>
)

/* ─── chat card ──────────────────────────────────────── */
const ChatCard = ({ label, color, messages, className = '' }) => (
  <div
    className={`rounded-2xl p-3.5 border mb-2.5 ${className}`}
    style={{ background: '#0f0d22', borderColor: 'rgba(255,255,255,0.07)' }}
  >
    <div className="flex items-center gap-2 mb-2.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color }}>
        {label}
      </span>
    </div>
    {messages.map((m, i) => <Bubble key={i} {...m} color={color} />)}
  </div>
)

/* ─── feature chip ───────────────────────────────────── */
const Chip = ({ icon: Icon, label, desc, delay }) => (
  <div
    className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/5 bg-white/[0.025]"
    style={{ animation: `fadeUp 0.45s ${delay}s ease both` }}
  >
    <Icon size={13} color="#818cf8" strokeWidth={1.8} />
    <div>
      <p className="text-[11px] font-semibold text-white/80 leading-none mb-0.5">{label}</p>
      <p className="text-[10px] text-white/25">{desc}</p>
    </div>
  </div>
)

/* ─── Home ───────────────────────────────────────────── */
const Home = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-12 relative overflow-hidden"
      style={{
        background: '#080712',
        fontFamily: "'Sora', 'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes devpulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
          50%      { box-shadow: 0 0 28px 4px rgba(99,102,241,0.22); }
        }
        .rt {
          background: linear-gradient(120deg,#f87171,#fb923c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[280px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.16) 0%, transparent 70%)' }}
      />

      {/* DEV badge */}
      <div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/20 bg-black/50 backdrop-blur"
        style={{ animation: 'fadeIn 0.4s ease both' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-amber-400"
          style={{ animation: 'devpulse 1.6s ease-in-out infinite' }}
        />
        <span className="text-[10px] font-bold tracking-widest uppercase text-amber-300" style={{ fontFamily: 'monospace' }}>
          Dev mode
        </span>
        <span className="text-[10px] text-amber-400/40" style={{ fontFamily: 'monospace' }}>
          · release soon
        </span>
      </div>

      {/* eyebrow badge */}
      <div
        className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5"
        style={{ animation: 'fadeUp 0.5s ease both' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
        <span
          className="text-[10px] font-semibold text-violet-300 tracking-widest uppercase"
          style={{ fontFamily: 'monospace' }}
        >
          AI chat · built for privacy
        </span>
      </div>

      {/* headline */}
      <h1
        className="text-4xl md:text-5xl font-bold text-white text-center leading-tight max-w-md mb-3"
        style={{ animation: 'fadeUp 0.5s 0.1s ease both', opacity: 0 }}
      >
        Your AI.<br />Your <span className="rt">secrets.</span>
      </h1>

      {/* sub */}
      <p
        className="text-white/35 text-sm text-center leading-relaxed max-w-[240px] mb-9 font-light"
        style={{ animation: 'fadeUp 0.5s 0.2s ease both', opacity: 0 }}
      >
        Three chat spaces. One is{' '}
        <span className="text-red-400 font-medium">hidden behind a password</span>
        {' '}— invisible to everyone but you.
      </p>

      {/* chat scene */}
      <div className="w-full max-w-[320px] mb-8 relative">

        <div style={{ animation: 'slideIn 0.45s 0.38s ease both', opacity: 0 }}>
          <ChatCard
            label="Personal"
            color="#60a5fa"
            messages={[
              { text: 'Plan my weekend trip', self: false },
              { text: "Here's a 3-day Goa itinerary…", self: true },
            ]}
          />
        </div>

        <div style={{ animation: 'slideIn 0.45s 0.52s ease both', opacity: 0 }}>
          <ChatCard
            label="Education"
            color="#34d399"
            messages={[
              { text: 'Explain neural networks', self: false },
              { text: 'Think of them as layered filters…', self: true },
            ]}
          />
        </div>

        {/* Secret card — blurred */}
        <div
          className="rounded-2xl p-3.5 border relative overflow-hidden mb-0"
          style={{
            background: '#0f0d22',
            borderColor: 'rgba(248,113,113,0.2)',
            animation: 'fadeIn 0.5s 0.66s ease both',
            opacity: 0,
          }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-red-400">Secret</span>
          </div>
          <Bubble text="••••••••••••••••" self={false} color="#f87171" />
          <Bubble text="•••••••••••••" self={true} color="#f87171" />

          {/* blur overlay */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              background: 'rgba(8,7,18,0.55)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                animation: 'glow 2.4s ease-in-out infinite',
              }}
            >
              <LockIcon size={18} color="#f87171" />
            </div>
            <span className="text-[11px] font-semibold text-red-400 tracking-wide">
              password protected
            </span>
          </div>
        </div>
      </div>

      {/* feature chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm mb-8">
        <Chip icon={Layers}      label="3 chat spaces" desc="fully isolated"   delay={0.85} />
        <Chip icon={ShieldCheck} label="Vault chat"    desc="password-locked"  delay={0.95} />
        <Chip icon={LayoutGrid}  label="Memory"        desc="context per space" delay={1.05} />
      </div>

      {/* CTA */}
      <button
        className="px-8 py-3 rounded-2xl text-sm font-semibold text-white cursor-pointer border-none"
        style={{
          background: 'linear-gradient(135deg,#6d28d9,#4338ca)',
          boxShadow: '0 0 24px rgba(99,102,241,0.22)',
          animation: 'fadeUp 0.45s 1.1s ease both',
          opacity: 0,
          fontFamily: "'Sora', sans-serif",
          transition: 'transform .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Get early access
      </button>

      {/* footer */}
      <p
        className="mt-5 text-[10px] text-white/12 tracking-widest text-center"
        style={{ fontFamily: 'monospace', animation: 'fadeIn 0.4s 1.3s ease both', opacity: 0 }}
      >
        end-to-end encrypted · zero logs · open-source core
      </p>
    </div>
  )
}

export default Home