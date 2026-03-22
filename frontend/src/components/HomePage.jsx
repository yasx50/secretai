import { SignedIn, SignedOut, SignOutButton, useSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #060810;
    --surface:    #0b0f1c;
    --surface2:   #111828;
    --border:     rgba(255,255,255,0.07);
    --border-h:   rgba(255,255,255,0.14);
    --accent:     #e8e0cc;
    --gold:       #c9a96e;
    --gold-dim:   rgba(201,169,110,0.12);
    --txt:        #d8dce8;
    --txt-soft:   #8a92aa;
    --txt-dim:    #3d4560;
    --font-s:     'Cormorant Garamond', serif;
    --font-b:     'DM Sans', sans-serif;
    --font-m:     'DM Mono', monospace;
  }

  html, body { height: 100%; }
  body {
    background: var(--bg);
    color: var(--txt);
    font-family: var(--font-b);
    overflow-x: hidden;
  }

  /* purely decorative – never intercept clicks */
  .bg-layer {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse 60% 50% at 0% 0%,    rgba(201,169,110,0.06) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 100% 100%, rgba(100,120,200,0.05) 0%, transparent 55%),
      var(--bg);
  }
  .bg-lines {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(
      90deg,
      rgba(255,255,255,0.013) 0px,
      rgba(255,255,255,0.013) 1px,
      transparent 1px,
      transparent 80px
    );
  }

  /* ─── Two-column shell ─── */
  .home-shell {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr auto;
  }

  /* ─── Left col ─── */
  .hero-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 64px 80px 72px;
    border-right: 1px solid var(--border);
  }

  .stamp {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-m);
    font-size: 0.62rem;
    font-weight: 300;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 52px;
    opacity: 0;
    animation: revealUp 0.7s 0.1s ease forwards;
  }
  .stamp-rule {
    display: inline-block;
    width: 28px;
    height: 1px;
    background: var(--gold);
    opacity: 0.55;
  }

  .hero-title {
    font-family: var(--font-s);
    font-size: clamp(3rem, 5vw, 5.6rem);
    font-weight: 300;
    line-height: 1.04;
    letter-spacing: -0.01em;
    color: var(--accent);
    margin-bottom: 32px;
    opacity: 0;
    animation: revealUp 0.8s 0.2s ease forwards;
  }
  .hero-title em {
    font-style: italic;
    color: var(--gold);
  }

  .hero-body {
    font-size: 0.88rem;
    font-weight: 300;
    line-height: 1.85;
    color: var(--txt-soft);
    max-width: 380px;
    margin-bottom: 56px;
    opacity: 0;
    animation: revealUp 0.8s 0.3s ease forwards;
  }

  .feat-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 13px;
    opacity: 0;
    animation: revealUp 0.8s 0.4s ease forwards;
  }
  .feat-item {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 0.76rem;
    font-weight: 300;
    color: var(--txt-dim);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .feat-mark {
    width: 20px;
    height: 1px;
    background: var(--gold);
    opacity: 0.4;
    flex-shrink: 0;
  }

  /* ─── Right col ─── */
  .auth-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 72px 80px 64px;
  }

  .auth-eyebrow {
    font-family: var(--font-m);
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--txt-dim);
    margin-bottom: 28px;
    opacity: 0;
    animation: revealUp 0.7s 0.3s ease forwards;
  }
  .auth-heading {
    font-family: var(--font-s);
    font-size: 2.2rem;
    font-weight: 400;
    color: var(--accent);
    margin-bottom: 10px;
    opacity: 0;
    animation: revealUp 0.7s 0.35s ease forwards;
  }
  .auth-sub {
    font-size: 0.82rem;
    font-weight: 300;
    color: var(--txt-soft);
    line-height: 1.7;
    margin-bottom: 44px;
    opacity: 0;
    animation: revealUp 0.7s 0.4s ease forwards;
  }

  /* ─── OAuth buttons ─── */
  .oauth-stack {
    display: flex;
    flex-direction: column;
    gap: 11px;
    opacity: 0;
    animation: revealUp 0.7s 0.45s ease forwards;
  }

  .oauth-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 15px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--txt);
    font-family: var(--font-b);
    font-size: 0.84rem;
    font-weight: 400;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
    text-align: left;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    /* z-index ensures it sits above bg layers */
    z-index: 2;
  }
  .oauth-btn:hover {
    border-color: var(--border-h);
    background: var(--surface2);
    box-shadow: 0 4px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .oauth-btn:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 3px;
  }
  .oauth-btn:active { transform: scale(0.997); }

  .oauth-logo {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .oauth-label { flex: 1; }
  .oauth-hint {
    font-family: var(--font-m);
    font-size: 0.6rem;
    letter-spacing: 0.06em;
    color: var(--txt-dim);
  }

  .or-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    font-family: var(--font-m);
    font-size: 0.58rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--txt-dim);
    margin: 4px 0;
  }
  .or-divider::before,.or-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ─── Signed-in block ─── */
  .si-block {
    opacity: 0;
    animation: revealUp 0.7s 0.3s ease forwards;
  }
  .si-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--gold-dim);
    border: 1px solid rgba(201,169,110,0.18);
    border-radius: 2px;
    padding: 5px 14px;
    font-family: var(--font-m);
    font-size: 0.6rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 32px;
  }
  .si-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 6px var(--gold);
    animation: blink 2.5s ease infinite;
  }
  @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.15} }

  .si-title {
    font-family: var(--font-s);
    font-size: 2.8rem;
    font-weight: 300;
    line-height: 1.05;
    color: var(--accent);
    margin-bottom: 14px;
  }
  .si-title em { font-style: italic; color: var(--gold); }
  .si-desc {
    font-size: 0.82rem;
    font-weight: 300;
    color: var(--txt-soft);
    line-height: 1.75;
    margin-bottom: 40px;
    max-width: 320px;
  }
  .si-actions { display: flex; gap: 12px; flex-wrap: wrap; }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 13px 28px;
    background: var(--gold);
    color: #08060000;
    color: #0d0a04;
    border: none;
    border-radius: 3px;
    font-family: var(--font-b);
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  .btn-primary:hover {
    background: #d4b47a;
    box-shadow: 0 6px 28px rgba(201,169,110,0.28);
    transform: translateY(-1px);
  }
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 22px;
    background: transparent;
    color: var(--txt-soft);
    border: 1px solid var(--border);
    border-radius: 3px;
    font-family: var(--font-b);
    font-size: 0.82rem;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-appearance: none;
    appearance: none;
  }
  .btn-ghost:hover { border-color: var(--border-h); color: var(--txt); }

  /* ─── Footer ─── */
  .home-footer {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 72px;
    border-top: 1px solid var(--border);
    font-family: var(--font-m);
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--txt-dim);
    opacity: 0;
    animation: revealUp 0.6s 0.6s ease forwards;
  }
  .home-footer a { color: var(--txt-dim); text-decoration: none; transition: color 0.2s; }
  .home-footer a:hover { color: var(--txt-soft); }
  .footer-links { display: flex; gap: 28px; }

  /* ─── Keyframe ─── */
  @keyframes revealUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── Responsive ─── */
  @media (max-width: 780px) {
    .home-shell { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
    .hero-col { padding: 56px 28px 40px; border-right: none; border-bottom: 1px solid var(--border); }
    .auth-col { padding: 44px 28px 56px; }
    .home-footer { padding: 16px 28px; flex-direction: column; gap: 10px; text-align: center; }
  }
`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.777L1.24 17.35C3.198 21.302 7.27 24 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
    <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
    <path fill="#FBBC05" d="M5.277 14.314a7.12 7.12 0 0 1-.388-2.314c0-.805.142-1.582.388-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.24 5.35l4.037-3.036Z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"/>
  </svg>
);

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

      {/* decorative bg – pointer-events:none so they never block clicks */}
      <div className="bg-layer" />
      <div className="bg-lines" />

      <div className="home-shell">

        {/* ══ LEFT — brand & copy ══ */}
        <section className="hero-col">
          <div className="stamp">
            <span className="stamp-rule" />
            Classified — Authorised access only
          </div>

          <h1 className="hero-title">
            Your thoughts,<br />
            <em>kept private.</em>
          </h1>

          <p className="hero-body">
            A private AI conversation space with category-based organisation
            and an optional secret vault — protected behind your existing
            social identity. Nothing is stored in plain sight.
          </p>

          <ul className="feat-list">
            {[
              "Five isolated chat categories",
              "Secret PIN-protected vault",
              "No third-party data sharing",
              "Session-authenticated API calls",
            ].map((f) => (
              <li key={f} className="feat-item">
                <span className="feat-mark" />
                {f}
              </li>
            ))}
          </ul>
        </section>

        {/* ══ RIGHT — auth ══ */}
        <section className="auth-col">

          <SignedOut>
            <p className="auth-eyebrow">Access Portal</p>
            <h2 className="auth-heading">Identify yourself</h2>
            <p className="auth-sub">
              Choose an authentication method below.<br />
              No password. No new account required.
            </p>

            <div className="oauth-stack">
              <button
                type="button"
                className="oauth-btn"
                onClick={() => loginWithProvider("oauth_google")}
              >
                <span className="oauth-logo"><GoogleIcon /></span>
                <span className="oauth-label">Continue with Google</span>
                <span className="oauth-hint">oauth / google</span>
              </button>

              <div className="or-divider">or</div>

              <button
                type="button"
                className="oauth-btn"
                onClick={() => loginWithProvider("oauth_facebook")}
              >
                <span className="oauth-logo"><FacebookIcon /></span>
                <span className="oauth-label">Continue with Facebook</span>
                <span className="oauth-hint">oauth / facebook</span>
              </button>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="si-block">
              <div className="si-badge">
                <span className="si-dot" />
                Identity verified
              </div>
              <h2 className="si-title">Access<br /><em>granted.</em></h2>
              <p className="si-desc">
                You are authenticated. Your private conversations
                are waiting in the secure chat area.
              </p>
              <div className="si-actions">
                <Link className="btn-primary" to="/chats">Enter Chats</Link>
                <SignOutButton>
                  <button type="button" className="btn-ghost">Revoke Session</button>
                </SignOutButton>
              </div>
            </div>
          </SignedIn>

        </section>

        {/* ══ FOOTER ══ */}
        <footer className="home-footer">
          <span>Secret AI Chat &mdash; Private by design</span>
          <nav className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Security</a>
          </nav>
        </footer>

      </div>
    </>
  );
};

export default HomePage;