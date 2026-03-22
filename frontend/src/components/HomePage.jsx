import { SignedIn, SignedOut, SignOutButton, useSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,700;0,900;1,300;1,700&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #05070f;
    --card:     rgba(12,17,32,0.85);
    --border:   rgba(255,255,255,0.08);
    --accent:   #c8f04c;
    --accent2:  #4fc8ff;
    --txt:      #eef0f7;
    --muted:    #5a6280;
    --font-d:   'Fraunces', serif;
    --font-b:   'DM Sans', sans-serif;
  }

  body { background: var(--bg); color: var(--txt); font-family: var(--font-b); overflow-x: hidden; }

  /* ── Full-page wrapper ── */
  .home-shell {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    overflow: hidden;
  }

  /* ── Animated mesh background ── */
  .mesh {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse 70% 55% at 15% 10%, rgba(200,240,76,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 55% 45% at 85% 90%, rgba(79,200,255,0.08) 0%, transparent 55%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(79,200,255,0.04) 0%, transparent 70%),
      var(--bg);
  }

  /* ── Floating orbs ── */
  .orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.18;
    pointer-events: none;
    z-index: 0;
    animation: drift linear infinite;
  }
  .orb-1 { width:500px;height:500px; background:#c8f04c; top:-120px; left:-100px; animation-duration:28s; }
  .orb-2 { width:420px;height:420px; background:#4fc8ff; bottom:-100px; right:-80px; animation-duration:22s; animation-direction:reverse; }
  .orb-3 { width:260px;height:260px; background:#a78bfa; top:50%;left:60%; animation-duration:35s; }
  @keyframes drift {
    0%   { transform: translate(0,0) scale(1); }
    33%  { transform: translate(30px,-40px) scale(1.05); }
    66%  { transform: translate(-20px,25px) scale(0.97); }
    100% { transform: translate(0,0) scale(1); }
  }

  /* ── Noise grain overlay ── */
  .grain {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0.028;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 180px 180px;
  }

  /* ── Content layer ── */
  .home-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  /* ── Badge ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 14px 5px 8px;
    background: rgba(200,240,76,0.08);
    border: 1px solid rgba(200,240,76,0.22);
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 28px;
    animation: fadeDown 0.6s ease both;
  }
  .badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent);
    animation: pulse 2s ease infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* ── Hero heading ── */
  .hero-title {
    font-family: var(--font-d);
    font-size: clamp(3rem, 9vw, 5.5rem);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -0.03em;
    text-align: center;
    margin-bottom: 20px;
    animation: fadeDown 0.6s 0.1s ease both;
  }
  .hero-title em {
    font-style: italic;
    font-weight: 300;
    color: transparent;
    -webkit-text-stroke: 1.5px rgba(200,240,76,0.7);
  }
  .hero-title .accent-word {
    color: var(--accent);
    display: block;
  }

  .hero-sub {
    font-size: 0.95rem;
    color: var(--muted);
    text-align: center;
    line-height: 1.65;
    max-width: 360px;
    margin-bottom: 44px;
    animation: fadeDown 0.6s 0.2s ease both;
  }

  /* ── Glass card ── */
  .glass-card {
    width: 100%;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 36px 36px 32px;
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.04) inset,
      0 40px 100px rgba(0,0,0,0.6),
      0 0 80px rgba(200,240,76,0.04);
    animation: fadeUp 0.7s 0.25s ease both;
  }
  @keyframes fadeDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:none} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)}  to{opacity:1;transform:none} }

  .card-label {
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-label::after {
    content:'';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── OAuth buttons ── */
  .oauth-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .oauth-btn {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 14px 20px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 14px;
    color: var(--txt);
    font-family: var(--font-b);
    font-size: 0.9rem;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.22s ease;
    text-align: left;
    position: relative;
    overflow: hidden;
  }
  .oauth-btn::before {
    content:'';
    position:absolute;
    inset:0;
    background: linear-gradient(135deg, rgba(255,255,255,0.06), transparent);
    opacity:0;
    transition: opacity 0.22s;
  }
  .oauth-btn:hover {
    border-color: rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.07);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.35);
  }
  .oauth-btn:hover::before { opacity:1; }
  .oauth-btn:active { transform: translateY(0); }

  .oauth-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.1rem;
  }
  .oauth-icon.google  { background: rgba(234,67,53,0.15);  border: 1px solid rgba(234,67,53,0.2); }
  .oauth-icon.facebook{ background: rgba(24,119,242,0.15); border: 1px solid rgba(24,119,242,0.2); }

  .oauth-btn-text { flex: 1; }
  .oauth-btn-text strong { display:block; font-weight:500; }
  .oauth-btn-text span { font-size:0.75rem; color:var(--muted); }
  .oauth-arrow { color:var(--muted); font-size:1rem; margin-left:auto; transition:transform 0.22s; }
  .oauth-btn:hover .oauth-arrow { transform:translateX(4px); color:var(--txt); }

  /* ── Divider ── */
  .divider {
    display:flex;
    align-items:center;
    gap:12px;
    margin:20px 0;
    color:var(--muted);
    font-size:0.75rem;
    letter-spacing:0.06em;
    text-transform:uppercase;
  }
  .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border);}

  /* ── Signed-in state ── */
  .signed-in-body { text-align:center; }
  .signed-in-avatar {
    width:64px;height:64px;
    border-radius:50%;
    background: linear-gradient(135deg,#c8f04c,#4fc8ff);
    display:flex;align-items:center;justify-content:center;
    font-size:1.6rem;
    margin:0 auto 16px;
    box-shadow: 0 0 30px rgba(200,240,76,0.25);
    animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes popIn { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }

  .signed-in-body h3 {
    font-family:var(--font-d);
    font-size:1.5rem;
    font-weight:700;
    margin-bottom:6px;
  }
  .signed-in-body p { font-size:0.85rem; color:var(--muted); margin-bottom:28px; }

  .action-row { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }

  .btn-cta {
    display:inline-flex;align-items:center;gap:8px;
    padding:13px 28px;
    background: var(--accent);
    color:#0a0f00;
    border:none;border-radius:12px;
    font-family:var(--font-b);font-size:0.88rem;font-weight:600;
    cursor:pointer;text-decoration:none;
    transition:all 0.22s ease;
    box-shadow: 0 4px 24px rgba(200,240,76,0.3);
    letter-spacing:0.01em;
  }
  .btn-cta:hover { transform:translateY(-2px); box-shadow:0 8px 36px rgba(200,240,76,0.45); background:#d4f75a; }

  .btn-outline {
    display:inline-flex;align-items:center;gap:8px;
    padding:13px 22px;
    background:transparent;
    color:var(--txt);
    border:1px solid var(--border);border-radius:12px;
    font-family:var(--font-b);font-size:0.88rem;font-weight:400;
    cursor:pointer;text-decoration:none;
    transition:all 0.22s ease;
  }
  .btn-outline:hover { border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.05); transform:translateY(-2px); }

  /* ── Footer note ── */
  .home-footer {
    position:relative;z-index:2;
    margin-top:28px;
    font-size:0.72rem;
    color:var(--muted);
    text-align:center;
    letter-spacing:0.03em;
    animation: fadeUp 0.6s 0.5s ease both;
    opacity: 0;
    animation-fill-mode: both;
  }
  .home-footer a { color:rgba(200,240,76,0.6); text-decoration:none; }
  .home-footer a:hover { color:var(--accent); }

  /* ── Features strip ── */
  .features {
    position:relative;z-index:2;
    display:flex;
    gap:24px;
    margin-top:32px;
    flex-wrap:wrap;
    justify-content:center;
    animation: fadeUp 0.6s 0.4s ease both;
    opacity:0;
    animation-fill-mode:both;
  }
  .feat {
    display:flex;align-items:center;gap:7px;
    font-size:0.77rem;color:var(--muted);
  }
  .feat-icon { font-size:0.95rem; }
`;

/* ─── Component ─────────────────────────────────────────────────────────── */
const HomePage = () => {
  const { signIn, isLoaded } = useSignIn();

  const loginWithProvider = async (strategy) => {
    if (!isLoaded) return;
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/chats",
    });
  };

  return (
    <>
      <style>{css}</style>

      {/* ambient bg */}
      <div className="mesh" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="grain" />

      <main className="home-shell">
        <div className="home-content">

          {/* Badge */}
          <div className="badge">
            <span className="badge-dot" />
            End-to-end private AI
          </div>

          {/* Hero */}
          <h1 className="hero-title">
            <em>Secret</em>
            <span className="accent-word">AI Chat</span>
          </h1>
          <p className="hero-sub">
            Private, categorised conversations powered by AI.
            Your messages stay yours — secured behind social login.
          </p>

          {/* ── SIGNED OUT ── */}
          <SignedOut>
            <div className="glass-card">
              <div className="card-label">Sign in to continue</div>
              <div className="oauth-stack">

                <button className="oauth-btn" onClick={() => loginWithProvider("oauth_google")}>
                  <span className="oauth-icon google">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                      <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.777L1.24 17.35C3.198 21.302 7.27 24 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                      <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                      <path fill="#FBBC05" d="M5.277 14.314a7.12 7.12 0 0 1-.388-2.314c0-.805.142-1.582.388-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.24 5.35l4.037-3.036Z"/>
                    </svg>
                  </span>
                  <span className="oauth-btn-text">
                    <strong>Continue with Google</strong>
                    <span>Sign in using your Google account</span>
                  </span>
                  <span className="oauth-arrow">→</span>
                </button>

                <button className="oauth-btn" onClick={() => loginWithProvider("oauth_facebook")}>
                  <span className="oauth-icon facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"/>
                    </svg>
                  </span>
                  <span className="oauth-btn-text">
                    <strong>Continue with Facebook</strong>
                    <span>Sign in using your Facebook account</span>
                  </span>
                  <span className="oauth-arrow">→</span>
                </button>

              </div>
            </div>
          </SignedOut>

          {/* ── SIGNED IN ── */}
          <SignedIn>
            <div className="glass-card">
              <div className="signed-in-body">
                <div className="signed-in-avatar">✦</div>
                <h3>Welcome back</h3>
                <p>You're signed in and ready to chat.</p>
                <div className="action-row">
                  <Link className="btn-cta" to="/chats">
                    Open Chats →
                  </Link>
                  <SignOutButton>
                    <button className="btn-outline">Logout</button>
                  </SignOutButton>
                </div>
              </div>
            </div>
          </SignedIn>

        </div>

        {/* Features strip */}
        <div className="features">
          <div className="feat"><span className="feat-icon">🔒</span> End-to-end private</div>
          <div className="feat"><span className="feat-icon">🗂</span> 5 chat categories</div>
          <div className="feat"><span className="feat-icon">🤫</span> Secret PIN vault</div>
          <div className="feat"><span className="feat-icon">⚡</span> Instant AI replies</div>
        </div>

        {/* Footer */}
        <p className="home-footer">
          By signing in you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>
        </p>

      </main>
    </>
  );
};

export default HomePage;