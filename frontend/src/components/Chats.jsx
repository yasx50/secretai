import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { SignOutButton, SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const categories = [
  { id: "general",      label: "General",     icon: "💬" },
  { id: "education",    label: "Education",   icon: "📚" },
  { id: "mail_messages",label: "Mail",        icon: "✉️" },
  { id: "single_words", label: "Single Word", icon: "🔤" },
  { id: "secret",       label: "Secret",      icon: "🔒" },
];

/* ─── Inline styles ──────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #080c14;
    --surface:   #0e1525;
    --surface2:  #141d30;
    --border:    rgba(255,255,255,0.07);
    --accent:    #4f8eff;
    --accent2:   #a78bfa;
    --glow:      rgba(79,142,255,0.18);
    --txt:       #e8edf5;
    --txt-muted: #6b7a99;
    --user-bg:   linear-gradient(135deg,#1e3a6e,#1a2f5a);
    --ai-bg:     #111827;
    --radius:    14px;
    --radius-sm: 8px;
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  body { background: var(--bg); color: var(--txt); font-family: var(--font-body); }

  .shell {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    background:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(79,142,255,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(167,139,250,0.10) 0%, transparent 55%),
      var(--bg);
  }

  /* ── Sign-out prompt ── */
  .gate-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 48px 40px;
    text-align: center;
    max-width: 360px;
    width: 100%;
  }
  .gate-card h2 {
    font-family: var(--font-head);
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 20px;
  }

  /* ── Main panel ── */
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 22px;
    width: 100%;
    max-width: 760px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px var(--border);
    animation: fadeUp 0.4s ease both;
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0);    }
  }

  /* ── Header ── */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 28px 18px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(79,142,255,0.05) 0%, transparent 100%);
  }
  .top-bar-left { display:flex; flex-direction:column; gap:3px; }
  .top-bar-title {
    font-family: var(--font-head);
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .avatar-dot {
    width: 9px; height: 9px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
    display: inline-block;
  }
  .top-bar-sub {
    font-size: 0.72rem;
    color: var(--txt-muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .top-bar-right { display:flex; align-items:center; gap:10px; }

  /* ── Tabs ── */
  .tabs {
    display: flex;
    gap: 4px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display:none; }
  .tab {
    flex-shrink: 0;
    padding: 7px 16px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--txt-muted);
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .tab:hover { color: var(--txt); background: rgba(255,255,255,0.04); }
  .tab.active {
    background: linear-gradient(135deg,rgba(79,142,255,0.18),rgba(167,139,250,0.14));
    border-color: rgba(79,142,255,0.35);
    color: var(--txt);
    font-weight: 600;
    box-shadow: 0 0 16px rgba(79,142,255,0.12);
  }
  .tab-icon { font-size: 0.9rem; }

  /* ── Secret unlock ── */
  .secret-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    background: rgba(167,139,250,0.05);
    animation: fadeIn 0.25s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .secret-bar .pin-input {
    flex: 1;
    min-width: 0;
  }

  /* ── Chat viewport ── */
  .chatbox {
    flex: 1;
    min-height: 320px;
    max-height: 420px;
    overflow-y: auto;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .chatbox::-webkit-scrollbar { width:4px; }
  .chatbox::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--txt-muted);
    gap: 8px;
    padding: 40px 0;
  }
  .empty-icon { font-size: 2rem; opacity:0.4; }
  .empty-state p { font-size: 0.85rem; }

  /* ── Messages ── */
  .msg-row {
    display: flex;
    animation: msgIn 0.22s ease both;
  }
  @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  .msg-row.user { justify-content: flex-end; }
  .msg-row.ai   { justify-content: flex-start; }

  .bubble {
    max-width: 72%;
    padding: 11px 16px;
    border-radius: 16px;
    font-size: 0.88rem;
    line-height: 1.55;
    position: relative;
  }
  .bubble.user {
    background: var(--user-bg);
    border: 1px solid rgba(79,142,255,0.25);
    border-bottom-right-radius: 4px;
    color: #d6e4ff;
  }
  .bubble.ai {
    background: var(--ai-bg);
    border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
    color: var(--txt);
  }
  .bubble-label {
    display: block;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 4px;
    opacity: 0.55;
  }

  /* ── Input bar ── */
  .input-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    background: rgba(8,12,20,0.5);
  }

  /* ── Shared input / button ── */
  input, .input {
    flex: 1;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 11px 16px;
    color: var(--txt);
    font-family: var(--font-body);
    font-size: 0.88rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    min-width: 0;
  }
  input::placeholder { color: var(--txt-muted); }
  input:focus {
    border-color: rgba(79,142,255,0.5);
    box-shadow: 0 0 0 3px rgba(79,142,255,0.1);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 11px 22px;
    border-radius: var(--radius-sm);
    border: none;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .btn-primary {
    background: linear-gradient(135deg,#3b78f5,#6c5ce7);
    color: #fff;
    box-shadow: 0 4px 20px rgba(79,142,255,0.3);
  }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(79,142,255,0.45);
  }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-ghost {
    background: transparent;
    color: var(--txt-muted);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { color: var(--txt); border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
  .btn-link {
    background: transparent;
    color: var(--accent);
    border: 1px solid rgba(79,142,255,0.3);
    text-decoration: none;
  }
  .btn-link:hover { background: rgba(79,142,255,0.1); }

  /* ── Error ── */
  .error-bar {
    margin: 0 20px 14px;
    padding: 10px 16px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: var(--radius-sm);
    color: #fca5a5;
    font-size: 0.82rem;
  }

  /* ── Spinner ── */
  @keyframes spin { to{transform:rotate(360deg)} }
  .spinner {
    width:14px; height:14px;
    border:2px solid rgba(255,255,255,0.3);
    border-top-color:#fff;
    border-radius:50%;
    animation: spin 0.6s linear infinite;
    display:inline-block;
  }

  /* ── Typing dots ── */
  .typing { display:flex; gap:4px; align-items:center; padding:4px 0; }
  .dot { width:6px;height:6px;background:var(--txt-muted);border-radius:50%;animation:bounce 1.2s infinite; }
  .dot:nth-child(2){animation-delay:.2s}
  .dot:nth-child(3){animation-delay:.4s}
  @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
`;

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
      <div className="shell">

        {/* ── Signed out ── */}
        <SignedOut>
          <div className="gate-card">
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🔐</div>
            <h2>Sign in to chat</h2>
            <p style={{ color: "var(--txt-muted)", fontSize: "0.85rem", marginBottom: "24px" }}>
              You need to be signed in to access your conversations.
            </p>
            <Link className="btn btn-link" to="/" style={{ display:"inline-flex" }}>← Go to Home</Link>
          </div>
        </SignedOut>

        {/* ── Signed in ── */}
        <SignedIn>
          <div className="panel">

            {/* Top bar */}
            <div className="top-bar">
              <div className="top-bar-left">
                <div className="top-bar-title">
                  <span className="avatar-dot" />
                  {user?.name || "Loading…"}
                </div>
                <span className="top-bar-sub">Clerk Auth · {activeCat?.label}</span>
              </div>
              <div className="top-bar-right">
                <Link className="btn btn-ghost" to="/" style={{ fontSize:"0.8rem", padding:"8px 14px" }}>Home</Link>
                <SignOutButton>
                  <button className="btn btn-ghost" style={{ fontSize:"0.8rem", padding:"8px 14px" }}>Logout</button>
                </SignOutButton>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`tab${activeCategory === c.id ? " active" : ""}`}
                  onClick={() => setActiveCategory(c.id)}
                >
                  <span className="tab-icon">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Secret PIN bar */}
            {activeCategory === "secret" && (
              <div className="secret-bar">
                <span style={{ fontSize:"1rem" }}>🔑</span>
                <input
                  className="pin-input"
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  placeholder="Secret PIN — first use sets it"
                  type="password"
                />
                <button
                  className="btn btn-ghost"
                  style={{ fontSize:"0.8rem", padding:"8px 14px" }}
                  onClick={() => user && loadChats(user.id, secretPin)}
                >
                  Unlock
                </button>
              </div>
            )}

            {/* Chat messages */}
            <div className="chatbox">
              {activeMessages.length === 0 && !loading ? (
                <div className="empty-state">
                  <span className="empty-icon">{activeCat?.icon}</span>
                  <p>No messages yet in {activeCat?.label}.</p>
                  <p style={{ fontSize:"0.78rem", opacity:0.6 }}>Say something to get started.</p>
                </div>
              ) : null}

              {activeMessages.map((m, idx) => (
                <div key={idx} className={`msg-row ${m.role === "user" ? "user" : "ai"}`}>
                  <div className={`bubble ${m.role === "user" ? "user" : "ai"}`}>
                    <span className="bubble-label">{m.role === "user" ? "You" : "AI"}</span>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="msg-row ai">
                  <div className="bubble ai">
                    <span className="bubble-label">AI</span>
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
            {error ? <div className="error-bar">⚠ {error}</div> : null}

            {/* Input */}
            <div className="input-bar">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), sendMessage()) : null}
                placeholder={`Message ${activeCat?.label}…`}
              />
              <button className="btn btn-primary" onClick={sendMessage} disabled={loading || !message.trim()}>
                {loading ? <span className="spinner" /> : "Send →"}
              </button>
            </div>

          </div>
        </SignedIn>
      </div>
    </>
  );
};

export default Chats;