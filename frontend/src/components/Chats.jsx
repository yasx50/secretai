import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { SignOutButton, SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const categories = [
  { id: "general",       label: "General",     short: "GEN" },
  { id: "education",     label: "Education",   short: "EDU" },
  { id: "mail_messages", label: "Mail",         short: "MAIL" },
  { id: "single_words",  label: "Single Word",  short: "WORD" },
  { id: "secret",        label: "Secret",       short: "SEC" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #060810;
    --surface:   #0b0f1c;
    --surface2:  #111828;
    --surface3:  #161e2e;
    --border:    rgba(255,255,255,0.07);
    --border-h:  rgba(255,255,255,0.13);
    --gold:      #c9a96e;
    --gold-dim:  rgba(201,169,110,0.1);
    --gold-glow: rgba(201,169,110,0.18);
    --accent:    #e8e0cc;
    --txt:       #d8dce8;
    --txt-soft:  #8a92aa;
    --txt-dim:   #3d4560;
    --user-bg:   linear-gradient(135deg, #1a1606, #2a2010);
    --font-s:    'Cormorant Garamond', serif;
    --font-b:    'DM Sans', sans-serif;
    --font-m:    'DM Mono', monospace;
  }

  html, body { height: 100%; }
  body { background: var(--bg); color: var(--txt); font-family: var(--font-b); overflow-x: hidden; }

  /* ── Background decorations – never intercept clicks ── */
  .bg-layer {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 55% 40% at 0% 0%,    rgba(201,169,110,0.055) 0%, transparent 55%),
      radial-gradient(ellipse 45% 35% at 100% 100%, rgba(100,120,200,0.04)  0%, transparent 55%),
      var(--bg);
  }
  .bg-lines {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: repeating-linear-gradient(
      90deg,
      rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px,
      transparent 1px, transparent 80px
    );
  }

  /* ── Shell ── */
  .shell {
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px 20px;
  }

  /* ── Gate card (signed out) ── */
  .gate-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 56px 48px;
    text-align: center;
    max-width: 380px;
    width: 100%;
    animation: revealUp 0.5s ease both;
  }
  .gate-icon {
    width: 44px; height: 44px;
    border: 1px solid rgba(201,169,110,0.25);
    border-radius: 2px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px;
    background: var(--gold-dim);
  }
  .gate-icon svg { width: 18px; height: 18px; stroke: var(--gold); fill: none; stroke-width: 1.5; stroke-linecap: round; }
  .gate-card h2 {
    font-family: var(--font-s);
    font-size: 1.8rem;
    font-weight: 400;
    color: var(--accent);
    margin-bottom: 10px;
  }
  .gate-card p { font-size: 0.82rem; font-weight: 300; color: var(--txt-soft); margin-bottom: 28px; line-height: 1.65; }
  .gate-link {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 24px;
    background: transparent;
    color: var(--txt-soft);
    border: 1px solid var(--border);
    border-radius: 3px;
    font-family: var(--font-b); font-size: 0.8rem; font-weight: 400;
    text-decoration: none;
    transition: all 0.2s;
  }
  .gate-link:hover { border-color: var(--border-h); color: var(--txt); }

  /* ── Main panel ── */
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    width: 100%;
    max-width: 820px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03);
    animation: revealUp 0.5s ease both;
    overflow: hidden;
  }
  @keyframes revealUp {
    from { opacity:0; transform: translateY(16px); }
    to   { opacity:1; transform: translateY(0); }
  }

  /* ── Top bar ── */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px 18px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(201,169,110,0.03) 0%, transparent 100%);
  }
  .top-bar-left { display: flex; flex-direction: column; gap: 4px; }
  .top-bar-title {
    font-family: var(--font-s);
    font-size: 1.3rem;
    font-weight: 400;
    color: var(--accent);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 8px var(--gold);
    flex-shrink: 0;
    animation: statusPulse 3s ease infinite;
  }
  @keyframes statusPulse { 0%,100%{opacity:1;box-shadow:0 0 8px var(--gold)} 50%{opacity:0.5;box-shadow:0 0 4px var(--gold)} }
  .top-bar-sub {
    font-family: var(--font-m);
    font-size: 0.6rem;
    font-weight: 300;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--txt-dim);
  }
  .top-bar-right { display: flex; align-items: center; gap: 8px; }

  /* ── Tabs ── */
  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab {
    flex-shrink: 0;
    padding: 13px 22px;
    border: none;
    border-right: 1px solid var(--border);
    background: transparent;
    color: var(--txt-dim);
    font-family: var(--font-m);
    font-size: 0.62rem;
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.18s ease;
    position: relative;
    white-space: nowrap;
  }
  .tab:last-child { border-right: none; }
  .tab:hover { color: var(--txt-soft); background: rgba(255,255,255,0.02); }
  .tab.active {
    color: var(--gold);
    background: var(--gold-dim);
  }
  .tab.active::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: var(--gold);
    opacity: 0.6;
  }

  /* ── Secret unlock bar ── */
  .secret-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    background: rgba(201,169,110,0.04);
    animation: fadeSlide 0.22s ease both;
  }
  @keyframes fadeSlide { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
  .secret-label {
    font-family: var(--font-m);
    font-size: 0.6rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    flex-shrink: 0;
  }

  /* ── Welcome banner ── */
  .welcome-banner {
    padding: 16px 28px;
    border-bottom: 1px solid var(--border);
    background: rgba(201,169,110,0.03);
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .welcome-rule { width: 20px; height: 1px; background: var(--gold); opacity:0.4; flex-shrink:0; margin-top: 8px; }
  .welcome-text { font-size: 0.78rem; color: var(--txt-soft); font-weight: 300; line-height: 1.6; }
  .welcome-text strong { font-weight: 400; color: var(--accent); font-family: var(--font-s); font-size: 0.95rem; font-style: italic; }

  /* ── Chatbox ── */
  .chatbox {
    flex: 1;
    min-height: 340px;
    max-height: 440px;
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .chatbox::-webkit-scrollbar { width: 3px; }
  .chatbox::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.15); border-radius: 3px; }

  /* ── Empty state ── */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
    gap: 12px;
  }
  .empty-emblem {
    width: 52px; height: 52px;
    border: 1px solid rgba(201,169,110,0.2);
    border-radius: 2px;
    display: flex; align-items: center; justify-content: center;
    background: var(--gold-dim);
    margin-bottom: 4px;
  }
  .empty-emblem svg { width: 20px; height: 20px; stroke: var(--gold); fill: none; stroke-width: 1.2; stroke-linecap: round; opacity: 0.7; }
  .empty-title {
    font-family: var(--font-s);
    font-size: 1.3rem;
    font-weight: 300;
    font-style: italic;
    color: var(--accent);
    opacity: 0.6;
  }
  .empty-sub {
    font-size: 0.75rem;
    font-weight: 300;
    color: var(--txt-dim);
    letter-spacing: 0.04em;
    text-align: center;
    max-width: 280px;
    line-height: 1.7;
  }

  /* ── Messages ── */
  .msg-row {
    display: flex;
    animation: msgIn 0.2s ease both;
  }
  @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  .msg-row.user { justify-content: flex-end; }
  .msg-row.ai   { justify-content: flex-start; }

  .bubble {
    max-width: 70%;
    padding: 12px 18px;
    font-size: 0.87rem;
    line-height: 1.65;
    border-radius: 2px;
  }
  .bubble.user {
    background: var(--user-bg);
    border: 1px solid rgba(201,169,110,0.18);
    border-bottom-right-radius: 0;
    color: #c8b98a;
  }
  .bubble.ai {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-bottom-left-radius: 0;
    color: var(--txt);
  }
  .bubble-label {
    display: block;
    font-family: var(--font-m);
    font-size: 0.56rem;
    font-weight: 300;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 5px;
    opacity: 0.45;
  }
  .bubble.user .bubble-label { color: var(--gold); }
  .bubble.ai   .bubble-label { color: var(--txt-soft); }

  /* ── Typing ── */
  .typing { display: flex; gap: 5px; align-items: center; padding: 3px 0; }
  .dot {
    width: 5px; height: 5px;
    background: var(--txt-dim);
    border-radius: 50%;
    animation: bounce 1.3s ease infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-4px)} }

  /* ── Error ── */
  .error-bar {
    margin: 0 20px 14px;
    padding: 10px 16px;
    background: rgba(180,50,50,0.1);
    border: 1px solid rgba(180,50,50,0.25);
    border-radius: 2px;
    font-family: var(--font-m);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    color: #e08080;
  }

  /* ── Input bar ── */
  .input-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    background: rgba(6,8,16,0.6);
  }

  /* ── Shared inputs ── */
  input {
    flex: 1;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 11px 16px;
    color: var(--txt);
    font-family: var(--font-b);
    font-size: 0.85rem;
    font-weight: 300;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    min-width: 0;
  }
  input::placeholder { color: var(--txt-dim); font-style: italic; }
  input:focus {
    border-color: rgba(201,169,110,0.35);
    box-shadow: 0 0 0 3px rgba(201,169,110,0.07);
  }

  /* ── Buttons ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 2px;
    border: 1px solid transparent;
    font-family: var(--font-b);
    font-size: 0.8rem;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
    flex-shrink: 0;
    letter-spacing: 0.03em;
    -webkit-appearance: none;
    appearance: none;
  }
  .btn-primary {
    background: var(--gold);
    color: #0d0a04;
    border-color: var(--gold);
    font-weight: 500;
  }
  .btn-primary:hover:not(:disabled) {
    background: #d4b47a;
    box-shadow: 0 4px 20px rgba(201,169,110,0.25);
    transform: translateY(-1px);
  }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-ghost {
    background: transparent;
    color: var(--txt-dim);
    border-color: var(--border);
  }
  .btn-ghost:hover { color: var(--txt-soft); border-color: var(--border-h); background: rgba(255,255,255,0.02); }
  .btn-link {
    background: transparent;
    color: var(--txt-soft);
    border-color: var(--border);
    text-decoration: none;
  }
  .btn-link:hover { color: var(--txt); border-color: var(--border-h); }

  /* ── Spinner ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 12px; height: 12px;
    border: 1.5px solid rgba(13,10,4,0.3);
    border-top-color: #0d0a04;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }

  /* ── Mono text util ── */
  .mono { font-family: var(--font-m); }
`;

/* ─── SVG icons (no emojis) ─── */
const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="1"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const KeyIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7.5" cy="15.5" r="4.5"/>
    <path d="m21 2-9.6 9.6M15.5 7.5l3 3"/>
  </svg>
);

/* ─── Component ─────────────────────────────────────────────────────────── */
const Chats = ({ apiUrl }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState("general");
  const [secretPin, setSecretPin] = useState("");
  const [message, setMessage] = useState("");
  const [chatMap, setChatMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const activeMessages = useMemo(() => chatMap[activeCategory] || [], [chatMap, activeCategory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, loading]);

  const loadChats = useCallback(async (userId, pin) => {
    const token = await getToken();
    const query = new URLSearchParams({ userid: userId, includeSecret: "true", secretPin: pin || "" });
    const response = await fetch(`${apiUrl}/api/chats?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load chats.");
    const nextMap = {};
    for (const c of data.chats) nextMap[c.category] = c.messages || [];
    setChatMap(nextMap);
  }, [apiUrl, getToken]);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !clerkUser) return;
      setError("");
      try {
        const token = await getToken();
        const displayName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User";
        const response = await fetch(`${apiUrl}/api/auth/sync-clerk`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: displayName }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to sync user.");
        setUser(data.user);
        await loadChats(data.user.id, "");
      } catch (err) {
        setError(err.message);
      }
    };
    syncUser();
  }, [apiUrl, getToken, isLoaded, clerkUser, loadChats]);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch(`${apiUrl}/api/chats/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userid: user.id,
          category: activeCategory,
          message,
          secretPin: activeCategory === "secret" ? secretPin : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send message.");
      setChatMap((prev) => ({ ...prev, [activeCategory]: data.messages || [] }));
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeCat = categories.find((c) => c.id === activeCategory);

  return (
    <>
      <style>{css}</style>
      <div className="bg-layer" />
      <div className="bg-lines" />

      <div className="shell">

        {/* ── Signed out ── */}
        <SignedOut>
          <div className="gate-card">
            <div className="gate-icon">
              <LockIcon />
            </div>
            <h2>Restricted Access</h2>
            <p>This area requires authentication.<br />Return to the portal to sign in.</p>
            <Link className="gate-link" to="/">← Return to Portal</Link>
          </div>
        </SignedOut>

        {/* ── Signed in ── */}
        <SignedIn>
          <div className="panel">

            {/* Top bar */}
            <div className="top-bar">
              <div className="top-bar-left">
                <div className="top-bar-title">
                  <span className="status-dot" />
                  {user?.name || "Loading…"}
                </div>
                <span className="top-bar-sub mono">
                  Secure Session &mdash; {activeCat?.label}
                </span>
              </div>
              <div className="top-bar-right">
                <Link className="btn btn-ghost" to="/" style={{ fontSize: "0.75rem", padding: "7px 14px" }}>
                  Portal
                </Link>
                <SignOutButton>
                  <button className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "7px 14px" }}>
                    End Session
                  </button>
                </SignOutButton>
              </div>
            </div>

            {/* Category tabs */}
            <div className="tabs">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`tab${activeCategory === c.id ? " active" : ""}`}
                  onClick={() => setActiveCategory(c.id)}
                >
                  {c.short}
                </button>
              ))}
            </div>

            {/* Secret PIN */}
            {activeCategory === "secret" && (
              <div className="secret-bar">
                <span className="secret-label">
                  <KeyIcon /> &nbsp; Vault PIN
                </span>
                <input
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  placeholder="Enter PIN — first use sets it"
                  type="password"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: "0.72rem", padding: "7px 16px" }}
                  onClick={() => user && loadChats(user.id, secretPin)}
                >
                  Unlock
                </button>
              </div>
            )}

            {/* Welcome/no-restriction banner */}
            <div className="welcome-banner">
              <span className="welcome-rule" />
              <p className="welcome-text">
                <strong>Ask anything, without restriction.</strong>{" "}
                This is your private space — no topic is off the table. Your conversations are yours alone, seen by no one else.
              </p>
            </div>

            {/* Chat messages */}
            <div className="chatbox">
              {activeMessages.length === 0 && !loading ? (
                <div className="empty-state">
                  <div className="empty-emblem">
                    <ChatIcon />
                  </div>
                  <p className="empty-title">Nothing here yet.</p>
                  <p className="empty-sub">
                    Begin your private conversation.<br />
                    Search, ask, confess, explore — no judgment, no limits.
                  </p>
                </div>
              ) : null}

              {activeMessages.map((m, idx) => (
                <div key={idx} className={`msg-row ${m.role === "user" ? "user" : "ai"}`}>
                  <div className={`bubble ${m.role === "user" ? "user" : "ai"}`}>
                    <span className="bubble-label">{m.role === "user" ? "You" : "Assistant"}</span>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="msg-row ai">
                  <div className="bubble ai">
                    <span className="bubble-label">Assistant</span>
                    <div className="typing">
                      <div className="dot" />
                      <div className="dot" />
                      <div className="dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Error */}
            {error ? <div className="error-bar">— {error}</div> : null}

            {/* Input */}
            <div className="input-bar">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey
                    ? (e.preventDefault(), sendMessage())
                    : null
                }
                placeholder={`Type anything — ${activeCat?.label} · private & unrestricted`}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={loading || !message.trim()}
              >
                {loading ? <span className="spinner" /> : "Send"}
              </button>
            </div>

          </div>
        </SignedIn>
      </div>
    </>
  );
};

export default Chats;